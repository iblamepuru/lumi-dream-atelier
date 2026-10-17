import { getStore } from '@netlify/blobs';

// Live Dream Guestbook backend (Netlify Functions + Netlify Blobs).
// GET  /api/guestbook          -> { wishes, visits }
// POST /api/guestbook  {author, message, emotion} -> { wish }
// POST /api/guestbook?visit=1  -> { visits }   (increments the global odometer)

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

export default async (req: Request) => {
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
    const message = clean(body.message, 120);
    if (message.length < 2) return json({ error: 'A wish needs a few words.' }, 400);
    const emotion = EMOTIONS.includes(body.emotion as Emotion) ? (body.emotion as Emotion) : 'Hope';
    const createdAt = Date.now();
    const wish: Wish = {
      id: `${(9_999_999_999_999 - createdAt).toString().padStart(13, '0')}-${Math.random().toString(36).slice(2, 8)}`,
      author: clean(body.author, 24) || 'A Gentle Dreamer',
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
