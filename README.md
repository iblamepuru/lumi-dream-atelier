# LUMI — The Dream Repair Atelier ✦

> *"Even the smallest light can rescue a dream."*

An interactive storybook portfolio for **Lumi**, a tiny moon moth who mends broken dreams and flies them home before sunrise.

- **Live site:** https://lumi-dream-atelier-hax.netlify.app/
- **Hackathon:** [haX.baby](https://hax.baby): Baby's First Website, 17–19 Oct 2026
- **Track:** Track 2: Your Own Baby (original character)

---

## The 5-point character sheet

1. **Name:** Lumi
2. **What they are:** A tiny moon moth with soft lavender wings, amber eyes and a knitted rose scarf. Quietly brave, curious, gentle, and a little forgetful. Hums lullabies off-key while sewing and collects lost buttons in a thimble.
3. **What they do:** Junior Dream Repairer at Workshop No. 07: mends broken dream crystals with moonlight thread, builds lanterns to shelter them, and flies them home before sunrise.
4. **Their story:** Lumi once woke a fallen star (Polara) that had forgotten how to shine. Lumi now lives in a cosy workshop inside an abandoned brass observatory above the clouds, and dreams of a lantern glowing in every sleeping window of the world.
5. **Tagline:** "Even the smallest light can rescue a dream."

---

## Pages

The home page tells the whole story on one scroll. Every part also has its own page, and all of them are linked by a 90s-style webring.

| Page | What's there |
|---|---|
| `/` | Moonlit hero, "Lumi in Three Answers", and every section below in order |
| `/meet-lumi` | Character sheet, mood switcher, signature objects, 2D ↔ 3D (Three.js) Lumi |
| `/story` | Four scroll-driven chapters with a chapter tracker and a travelling light |
| `/workshop` | The three inventions, each with its own page: `/workshop/repair-lab`, `/workshop/lantern-studio`, `/workshop/delivery-map` |
| `/playroom` | Lullaby Lab music box and the *Catch the Falling Dreams* mini-game |
| `/dream-friends` | Dream Friend Maker: build a ghost, cloud, robot, alien, monster or fantastical you |
| `/guestbook` | Live shared wish wall and visitor odometer |
| `/goodnight` | Secret constellation and the ending |

---

## How it meets the brief

**Core elements.** Character intro and sheet · 3+ projects (Repair Lab, Lantern Studio, Delivery Map) · scroll-driven origin story · reacts to the visitor (eye tracking, clicks, sound with mute) · mobile layout · hidden Easter eggs.

**Tier 1.** Eyes follow the pointer (touch fallback) · scroll-driven chapters · Twilight/Midnight toggle changes palette *and* Lumi's expression · responsive down to 320px · Easter eggs: five hidden stars unlock a constellation, diary and golden crown, and Lumi dozes off after 20 seconds of stillness.

**Tier 2.** Lullaby Lab (Web Audio music box with an original lullaby, record and replay) · *Catch the Falling Dreams* mini-game (pointer, touch and keyboard).

**Tier 3.** 3D Lumi in Three.js · live guestbook (Netlify Functions + Blobs) · remembers returning visitors · Lumi chats back in character (Claude, with rule-based fallback) · Lighthouse mobile: Performance 86–94, Accessibility 100, Best Practices 100, SEO 100 (in our runs).

**Side quests.** Live guestbook · sparkle cursor trail · hit-counter odometer · click sounds with an always-visible mute switch · Responsive Chaos Mode (⚡ in the header), a 90s homepage skin that re-lays itself out for phone, tablet and desktop, with a live screen-size marquee.

---

## Tech

React 19 · TypeScript · Vite · Tailwind CSS · Three.js · Web Audio API · HTML5 Canvas · Netlify Functions + Netlify Blobs · Anthropic SDK (Claude).

Performance notes: a static boot screen with inlined CSS paints before the app loads; below-the-fold sections and Three.js load on demand; idle animation loops are paused.

```
src/
  components/   hero, character sheet, story, workshop, guestbook, chat, chaos mode, webring…
  projects/     Dream Repair Lab, Lantern Studio, Delivery Navigator
  playroom/     Lullaby Lab, Catch the Falling Dreams
  friends/      Dream Friend Maker
  context/      shared state + localStorage memory
  router.ts     tiny History-API router (no dependencies)
netlify/functions/
  guestbook.mts   /api/guestbook (wishes + visit counter in Netlify Blobs)
  lumi-chat.mts   /api/lumi-chat (Claude, in-character, rate limited)
```

---

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Locally the guestbook saves in your browser and the chat uses rule-based replies; both go live on Netlify.

**Deploy (Netlify):** import the repo; `netlify.toml` sets the build. Optional environment variables: `ANTHROPIC_API_KEY` (AI chat) and `LUMI_MODEL` (defaults to `claude-opus-5-5`).

---

## Credits

- **Character, story and art:** original, made for haX.baby. Hand-built SVG, CSS, Canvas and a Three.js model; no external images or existing characters.
- **Audio:** generated live with the Web Audio API; the music box and "Lumi's Lullaby" are original.
- **Fonts:** Fraunces, Fredoka, Nunito (Google Fonts, SIL Open Font License).
- **Libraries:** React, Vite, TypeScript, Tailwind CSS, Three.js (MIT/Apache-2.0); Lucide React, canvas-confetti (ISC).
- **Services:** Netlify (hosting, Functions, Blobs); Claude by Anthropic (Ask Lumi chat).
- **AI tools:** built with help from AI coding assistants (Claude Code); all code reviewed, tested and shipped by the author.
