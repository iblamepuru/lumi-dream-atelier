<h1 align="center">LUMI — The Dream Repair Atelier ✦</h1>

<p align="center"><em>"Even the smallest light can rescue a dream."</em></p>

<p align="center">
  <a href="https://lumi-dream-atelier-hax.netlify.app/"><strong>🌙 Visit the live site</strong></a>
  &nbsp;·&nbsp; haX.baby: Baby's First Website (17–19 Oct 2026)
  &nbsp;·&nbsp; Track 2: Your Own Baby
</p>

<p align="center">
  <img src="docs/screenshots/01-hero.jpg" alt="Lumi's moonlit hero: a tiny moon moth with a brass lantern beside a crescent moon" width="900">
</p>

An interactive storybook portfolio for **Lumi**, a tiny moon moth who mends broken dreams and flies them home before sunrise.

---

## Meet Lumi

<p align="center">
  <img src="docs/screenshots/02-three-answers.jpg" alt="Lumi in Three Answers: what Lumi is, what Lumi does, Lumi's story" width="900">
</p>

### The 5-point character sheet

1. **Name:** Lumi
2. **What they are:** A tiny moon moth with soft lavender wings, amber eyes and a knitted rose scarf. Quietly brave, curious, gentle, and a little forgetful. Hums lullabies off-key while sewing and collects lost buttons in a thimble.
3. **What they do:** Junior Dream Repairer at Workshop No. 07: mends broken dream crystals with moonlight thread, builds lanterns to shelter them, and flies them home before sunrise.
4. **Their story:** Lumi once woke a fallen star (Polara) that had forgotten how to shine. Lumi now lives in a cosy workshop inside an abandoned brass observatory above the clouds, and dreams of a lantern glowing in every sleeping window of the world.
5. **Tagline:** "Even the smallest light can rescue a dream."

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/03-character-sheet.jpg" alt="Character sheet with mood switcher and signature objects"></td>
    <td width="50%"><img src="docs/screenshots/04-3d-lumi.jpg" alt="Lumi as a rotatable Three.js 3D model"></td>
  </tr>
  <tr>
    <td><b>Character sheet:</b> eyes follow your cursor; mood buttons change Lumi's face; the day/night toggle changes the palette and expression.</td>
    <td><b>3D Lumi (Three.js):</b> drag to orbit, auto-rotate, a lantern that casts real light.</td>
  </tr>
</table>

---

## A tour of the site

The home page tells the whole story in one scroll. Every part also has its own page, and all of them are joined by a 90s-style webring.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/05-story.jpg" alt="Scroll-driven origin story chapters"></td>
    <td width="50%"><img src="docs/screenshots/06-workshop.jpg" alt="The Workshop with three invention cards"></td>
  </tr>
  <tr>
    <td><b>Origin story</b> (<code>/story</code>): four scroll-driven chapters with a chapter tracker; tap to wake the star and gather the shards.</td>
    <td><b>The Workshop</b> (<code>/workshop</code>): three connected inventions, each opening its own page.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/07-lantern-studio.jpg" alt="Moonlight Lantern Studio lantern builder"></td>
    <td><img src="docs/screenshots/08-delivery-map.jpg" alt="Dream Delivery Navigator flight map"></td>
  </tr>
  <tr>
    <td><b>Lantern Studio:</b> design a lantern for your dream and download a keepsake card.</td>
    <td><b>Delivery Map:</b> fly the mended dream home to three sleeping corners of the world.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/09-playroom.jpg" alt="Night Playroom with music box and mini-game"></td>
    <td><img src="docs/screenshots/10-friend-maker.jpg" alt="Dream Friend Maker with a nursery shelf of six friends"></td>
  </tr>
  <tr>
    <td><b>Night Playroom</b> (<code>/playroom</code>): a star-comb music box with an original lullaby, and <i>Catch the Falling Dreams</i>, where every catch plays the next note.</td>
    <td><b>Dream Friend Maker</b> (<code>/dream-friends</code>): sew your own ghost, cloud, robot, alien, monster or fantastical you.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/11-guestbook.jpg" alt="Live guestbook wall and visitor odometer"></td>
    <td><img src="docs/screenshots/13-ask-lumi-chat.jpg" alt="Ask Lumi chat answering in character"></td>
  </tr>
  <tr>
    <td><b>Sleepers' Guestbook</b> (<code>/guestbook</code>): a live, shared wish wall with a mechanical visitor odometer.</td>
    <td><b>Ask Lumi:</b> Lumi chats back in character (Claude), with rule-based replies as a fallback.</td>
  </tr>
</table>

### Responsive Chaos Mode ⚡

One click on ⚡ turns the site into a 90s homepage that re-lays itself out for every screen size, with a live marquee reporting your layout.

<table>
  <tr>
    <td width="70%"><img src="docs/screenshots/12-chaos-mode.jpg" alt="Chaos Mode on desktop: each section becomes a retro program window"></td>
    <td width="30%"><img src="docs/screenshots/15-mobile-chaos.jpg" alt="Chaos Mode on a phone: Pocket Pager layout"></td>
  </tr>
  <tr>
    <td><b>Desktop: "Mega Monitor"</b>, where every section becomes a window like <code>profile.exe</code>.</td>
    <td><b>Phone: "Pocket Pager"</b>, a tilted scrapbook.</td>
  </tr>
</table>

### On a phone

<p>
  <img src="docs/screenshots/14-mobile-hero.jpg" alt="Lumi's hero on a phone" width="260">
  &nbsp;
  <img src="docs/screenshots/15-mobile-chaos.jpg" alt="Chaos Mode on a phone" width="260">
</p>

---

## How it meets the brief

| | |
|---|---|
| **Core elements** | Character intro and sheet · 3+ projects · scroll-driven origin story · reacts to the visitor (eye tracking, clicks, sound with mute) · mobile layout · hidden Easter eggs |
| **Tier 1** | Eyes follow the pointer (touch fallback) · scroll-driven chapters · Twilight/Midnight toggle changes palette *and* expression · responsive down to 320px · Easter eggs: five hidden stars unlock a constellation, diary and golden crown, and Lumi dozes off after 20 seconds of stillness |
| **Tier 2** | Lullaby Lab (Web Audio music box, original lullaby, record and replay) · *Catch the Falling Dreams* mini-game (pointer, touch and keyboard) |
| **Tier 3** | 3D Lumi (Three.js) · live guestbook (Netlify Functions + Blobs) · remembers returning visitors · chats back in character (Claude + fallback) · Lighthouse mobile in our runs: Performance 86–94, Accessibility 100, Best Practices 100, SEO 100 |
| **Side quests** | Live guestbook · sparkle cursor trail · hit-counter odometer · click sounds with an always-visible mute switch · Responsive Chaos Mode |

---

## Tech

React 19 · TypeScript · Vite · Tailwind CSS · Three.js · Web Audio API · HTML5 Canvas · Netlify Functions + Netlify Blobs · Anthropic SDK (Claude).

A static boot screen with inlined CSS paints before the app loads; below-the-fold sections and Three.js load on demand; idle animation loops pause.

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
  lumi-chat.mts   /api/lumi-chat (Claude, in character, rate limited)
```

### Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Locally the guestbook saves in your browser and the chat uses rule-based replies; both go live on Netlify. Netlify settings come from `netlify.toml`; optional environment variables are `ANTHROPIC_API_KEY` (AI chat) and `LUMI_MODEL` (defaults to `claude-opus-5-5`).

---

## Credits

- **Character, story and art:** original, made for haX.baby. Hand-built SVG, CSS, Canvas and a Three.js model; no external images or existing characters. Screenshots in `docs/` are of the live site.
- **Audio:** generated live with the Web Audio API; the music box and "Lumi's Lullaby" are original.
- **Fonts:** Fraunces, Fredoka, Nunito (Google Fonts, SIL Open Font License).
- **Libraries:** React, Vite, TypeScript, Tailwind CSS, Three.js (MIT/Apache-2.0); Lucide React, canvas-confetti (ISC).
- **Services:** Netlify (hosting, Functions, Blobs); Claude by Anthropic (Ask Lumi chat).
- **AI tools:** built with help from AI coding assistants (Claude Code); all code reviewed, tested and shipped by the author.
