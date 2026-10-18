import { getStore } from '@netlify/blobs';

// Shared protection for the public endpoints: durable rate limits (stored in Netlify Blobs, so
// they hold across function instances), privacy-friendly visitor ids, and gentle moderation.

const limits = () => getStore({ name: 'lumi-limits', consistency: 'strong' });

/** A salted SHA-256 of the visitor's IP: enough to rate-limit, never stored in the clear. */
export async function visitorId(ip: string | undefined): Promise<string> {
  const salt = process.env.LUMI_HASH_SALT || 'lumi-moon-moth';
  const bytes = new TextEncoder().encode(`${salt}:${ip || 'unknown'}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Fixed-window counter. Returns true while `key` has been used fewer than `max` times in the
 * current window. Concurrent requests can occasionally over-count by one, which is fine here.
 */
export async function allow(key: string, max: number, windowMs: number): Promise<boolean> {
  const store = limits();
  const now = Date.now();
  const entry = ((await store.get(key, { type: 'json' })) as { count: number; resetAt: number } | null) ?? null;
  const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + windowMs };
  if (current.count >= max) return false;
  await store.setJSON(key, { count: current.count + 1, resetAt: current.resetAt });
  return true;
}

/** True only the first time this visitor is seen today (used to keep the odometer honest). */
export async function firstVisitToday(id: string): Promise<boolean> {
  const store = limits();
  const day = new Date().toISOString().slice(0, 10);
  const key = `visit/${day}/${id}`;
  if (await store.get(key)) return false;
  await store.set(key, '1');
  return true;
}

// Kept short on purpose: this is a cosy site for children, so we only need to catch the obvious.
// A trailing * matches word stems ("fuck*" also catches "fucking"); everything else is a whole word,
// so innocent words like "sextant" or "Scunthorpe" stay allowed.
const BLOCKED = [
  'fuck*', 'shit*', 'bitch*', 'bastard*', 'dick', 'pussy', 'cunt*', 'slut*', 'whore*', 'nigg*', 'fag*', 'retard*',
  'kys', 'porn*', 'sex', 'sexy', 'nude*', 'naked', 'rape*', 'nazi*', 'casino*', 'crypto', 'viagra',
].map((w) => new RegExp(w.endsWith('*') ? `\\b${w.slice(0, -1)}` : `\\b${w}\\b`));
const PHRASES = ['kill yourself', 'go die'];

/** Undo common symbol swaps (b!tch, sh1t, 4ss...) before matching. */
const unmask = (text: string) =>
  text.toLowerCase().replace(/[!1|]/g, 'i').replace(/3/g, 'e').replace(/[4@]/g, 'a').replace(/0/g, 'o').replace(/[$5]/g, 's');

export type ModerationResult = { ok: true } | { ok: false; reason: string };

/** Gentle checks for a public, child-friendly wall: no links, contact details or rude words. */
export function moderate(text: string): ModerationResult {
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|xyz|ru|in|co|me|app|link)\b)/i.test(text)) {
    return { ok: false, reason: 'Links can’t ride on starlight thread. Try a wish without a web address.' };
  }
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text) || /(\d[\s-]?){7,}/.test(text)) {
    return { ok: false, reason: 'Let’s keep emails and phone numbers safe at home. Try a wish without them.' };
  }
  const plain = unmask(text);
  if (BLOCKED.some((re) => re.test(plain)) || PHRASES.some((p) => plain.includes(p))) {
    return { ok: false, reason: 'That wish is a little too stormy for the nursery wall. Try a gentler one?' };
  }
  if (text.length >= 12 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return { ok: false, reason: 'Shh, the dreamers are sleeping! Try your wish without all the capitals.' };
  }
  return { ok: true };
}
