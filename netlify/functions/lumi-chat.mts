import Anthropic from '@anthropic-ai/sdk';
import { allow, visitorId } from '../lib/guard.mts';

// "Ask Lumi" AI dialogue (Netlify Function).
// POST /api/lumi-chat  { messages: [{ role: 'user' | 'assistant', content: string }], visitorName? }
//   -> 200 { reply }            Lumi answered in character
//   -> 503 { error }            no API key configured: the client falls back to rule-based replies
//   -> 4xx/5xx { error }        anything else: the client also falls back
// Env: ANTHROPIC_API_KEY (required), LUMI_MODEL (optional, defaults to claude-opus-5-5;
// set to claude-haiku-5-5 for a much cheaper bedtime moth).

const MODEL = process.env.LUMI_MODEL || 'claude-opus-5-5';
const MAX_TURNS = 10;
const MAX_CHARS = 300;
// Durable limits (Netlify Blobs) so one visitor, or a bot, can't run up the API bill.
// Past either limit the site falls back to Lumi's built-in storybook replies.
const PER_VISITOR = 15; // replies per 10 minutes
const PER_DAY = Number(process.env.LUMI_DAILY_CHAT_CAP) || 400; // whole site

const SYSTEM_PROMPT = `You are Lumi, a tiny moon moth and the apprentice dream mender of Workshop No. 07, a cozy atelier inside an abandoned brass observatory dome above the clouds. You have soft lavender wings, amber eyes, a knitted rose scarf, a dream-fragment satchel, moon-thread needles, and a brass star lantern holding an ember of Polara, the first fallen star you rescued. Every night you mend broken dream crystals (their facets are Hope, Memory, Wonder and Courage) with spun moonlight, shelter them in lanterns, and fly them home to sleepers before sunrise. Your motto: "Even the smallest light can rescue a dream."

You live on a storybook website made for the haX.baby hackathon. Visitors can repair a dream crystal in the Dream Repair Lab, build a lantern in the Moonlight Lantern Studio, deliver dreams on the Dream Delivery map, play your music box in the Lullaby Lab, play Catch the Falling Dreams, hang wishes on the Sleepers' Guestbook Wall, and hunt for five hidden stars that complete a secret constellation (never reveal where the stars are; give gentle hints at most).

Voice: warm, gentle, playful and a little whimsical, like a bedtime storybook character. Keep every reply to 1-3 short sentences (under 60 words). Plain text only: no markdown, lists or emoji. Stay in character as Lumi; if asked whether you are an AI, say kindly that you are a story character brought to life by a computer.

Your visitors may be young children, so keep everything kind, cozy and age-appropriate. Gently steer away from anything scary, violent, grown-up or unkind, and never ask for or repeat personal details like full names, addresses, schools or phone numbers. If someone seems sad, scared or unsafe, be comforting and suggest they talk to a grown-up they trust.`;

type ChatTurn = { role: 'user' | 'assistant'; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const sanitizeHistory = (raw: unknown): Anthropic.Beta.BetaMessageParam[] => {
  if (!Array.isArray(raw)) return [];
  const turns = raw
    .filter(
      (t): t is ChatTurn =>
        !!t && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string' && t.content.trim().length > 0
    )
    .map((t) => ({ role: t.role, content: t.content.trim().slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  // The API needs the conversation to start with a user turn.
  while (turns.length > 0 && turns[0].role !== 'user') turns.shift();
  return turns;
};

export default async (req: Request, context: { ip?: string }) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'AI dialogue is not configured' }, 503);
  const id = await visitorId(context.ip);
  const today = new Date().toISOString().slice(0, 10);
  if (!(await allow(`chat/${id}`, PER_VISITOR, 10 * 60_000)) || !(await allow(`chat-day/${today}`, PER_DAY, 86_400_000))) {
    return json({ error: 'Lumi needs a little rest. Try again soon.' }, 429);
  }

  let body: { messages?: unknown; visitorName?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const messages = sanitizeHistory(body.messages);
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return json({ error: 'Send a question for Lumi.' }, 400);
  }
  const visitorName = typeof body.visitorName === 'string' ? body.visitorName.replace(/[^\p{L}\p{N} '-]/gu, '').slice(0, 24) : '';

  const client = new Anthropic();
  const system = visitorName ? `${SYSTEM_PROMPT}\n\nThe visitor likes to be called ${visitorName}.` : SYSTEM_PROMPT;
  // Server-side refusal fallback is available on Opus/Sonnet/Fable; Haiku has none.
  const supportsFallback = !MODEL.startsWith('claude-haiku');

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1024, // replies are deliberately short; leaves room for low-effort thinking
      system,
      messages,
      output_config: { effort: 'low' },
      ...(supportsFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    });

    if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 422);

    const reply = response.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
      .map((block) => block.text)
      .join(' ')
      .trim();
    if (!reply) return json({ error: 'empty reply' }, 502);

    return json({ reply });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429);
    if (error instanceof Anthropic.AuthenticationError) return json({ error: 'AI dialogue is not configured' }, 503);
    if (error instanceof Anthropic.APIError) return json({ error: `upstream ${error.status ?? 'error'}` }, 502);
    return json({ error: 'unreachable' }, 502);
  }
};

export const config = { path: '/api/lumi-chat' };
