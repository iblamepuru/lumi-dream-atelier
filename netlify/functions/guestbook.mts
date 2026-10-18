import { getStore } from '@netlify/blobs';
import { allow, firstVisitToday, moderate, visitorId } from '../lib/guard.mts';

// Live Dream Guestbook backend (Netlify Functions + Netlify Blobs).
// GET  /api/guestbook          -> { wishes, visits }
// POST /api/guestbook  {author, message, emotion} -> { wish }
// POST /api/guestbook?visit=1  -> { visits }   (counts each visitor at most once a day)
//
// Protection: per-visitor and site-wide rate limits stored in Blobs, a hidden honeypot field,
// a minimum fill-in time, and gentle moderation (no links, contact details or rude words).
const WISHES_PER_VISITOR = 3; // per 10 minutes
const WISHES_PER_DAY = 60; // whole site
const MIN_FILL_MS = 2500;

const EMOTIONS = ['Hope', 'Wonder', 'Peace', 'Courage'] as const;
type Emotion = (typeof EMOTIONS)[number];

interface Wish {
  id: string;
  author: string;
  message: string;
  emotion: Emotion;
  createdAt: number;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const clean = (value: unknown, max: number) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const readVisits = async (store: ReturnType<typeof getStore>) =>
  Number((await store.get('meta/visits')) ?? 0) || 0;

export default async (req: Request, context: { ip?: string }) => {
  const store = getStore({ name: 'lumi-guestbook', consistency: 'strong' });
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const { blobs } = await store.list({ prefix: 'wish/' });
    // Keys are wish/<invertedTimestamp>-<rand>, so lexical order = newest first.
    const newest = blobs.map((b) => b.key).sort().slice(0, 60);
    const wishes = (
      await Promise.all(newest.map((key) => store.get(key, { type: 'json' }) as Promise<Wish | null>))
    ).filter(Boolean);
    return json({ wishes, visits: await readVisits(store) });
  }

  if (req.method === 'POST' && url.searchParams.has('visit')) {
    const id = await visitorId(context.ip);
    if (!(await firstVisitToday(id))) return json({ visits: await readVisits(store) });
    const visits = (await readVisits(store)) + 1;
    await store.set('meta/visits', String(visits));
    return json({ visits });
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }
    // Bots fill hidden fields and submit instantly; pretend it worked so they move on.
    const filledTooFast = typeof body.elapsedMs === 'number' && body.elapsedMs < MIN_FILL_MS;
    if (clean(body.website, 80) || filledTooFast) return json({ wish: null }, 202);

    const message = clean(body.message, 120);
    if (message.length < 2) return json({ error: 'A wish needs a few words.' }, 400);
    const author = clean(body.author, 24);
    const verdict = moderate(`${author} ${message}`);
    if (!verdict.ok) return json({ error: verdict.reason }, 422);

    const id = await visitorId(context.ip);
    const today = new Date().toISOString().slice(0, 10);
    if (!(await allow(`wish/${id}`, WISHES_PER_VISITOR, 10 * 60_000)) || !(await allow(`wish-day/${today}`, WISHES_PER_DAY, 86_400_000))) {
      return json({ error: 'The wall is full of wishes for now. Please try again a little later.' }, 429);
    }
    const emotion = EMOTIONS.includes(body.emotion as Emotion) ? (body.emotion as Emotion) : 'Hope';
    const createdAt = Date.now();
    const wish: Wish = {
      id: `${(9_999_999_999_999 - createdAt).toString().padStart(13, '0')}-${Math.random().toString(36).slice(2, 8)}`,
      author: author || 'A Gentle Dreamer',
      message,
      emotion,
      createdAt,
    };
    await store.setJSON(`wish/${wish.id}`, wish);
    return json({ wish }, 201);
  }

  return json({ error: 'Method not allowed' }, 405);
};

export const config = { path: '/api/guestbook' };
