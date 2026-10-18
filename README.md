# LUMI — The Dream Repair Atelier ✦

> *"Even the smallest light can rescue a dream."*

[**Visit the live atelier**](https://lumi-dream-atelier-hax.netlify.app/) · [**Build notes for judges**](https://lumi-dream-atelier-hax.netlify.app/build-notes) · haX.baby — Baby's First Website · **Track 2: Your Own Baby**

An interactive storybook portfolio for **Lumi**, a tiny moon moth who repairs broken dreams and guides them home before sunrise.

![Lumi's moonlit atelier home page, showing the hero and character introduction](docs/screenshots/01-hero-current.png)

## Meet Lumi

| Character sheet | |
| --- | --- |
| **Name** | Lumi |
| **What they are** | A tiny moon moth with lavender wings, amber eyes, and a knitted rose scarf. Quietly brave, curious, gentle, and a little forgetful. |
| **What they do** | Junior Dream Repairer at Workshop No. 07. Lumi mends broken dream crystals with moonlight thread, shelters them in lanterns, then flies them home. |
| **Their story** | After waking a fallen star named Polara, Lumi began a lifelong mission to rescue dreams before sunrise. |
| **Tagline** | *“Even the smallest light can rescue a dream.”* |

## Start Lumi's journey

The home page guides first-time visitors and judges through the strongest two minutes of the project:

1. Wake the fallen star.
2. Repair the dream crystal.
3. Make a lantern and create its keepsake card.
4. Deliver the restored dream home.
5. Find a hidden star in the atelier.

## Explore the atelier

| Storybook origin | Workshop No. 07 |
| --- | --- |
| ![Current view of Lumi's four-chapter interactive origin story](docs/screenshots/02-story-current.png) | ![Current view of Lumi's connected dream-repair workshop](docs/screenshots/03-workshop-current.png) |
| Four scroll-driven chapters: wake Polara, collect fragments, inspect the observatory tools, and begin Lumi's next journey. | Repair a crystal, design its lantern, and chart its journey across the Dream Delivery Navigator. |

| Night Playroom | More to discover |
| --- | --- |
| ![Current view of the Night Playroom and its star-comb music box](docs/screenshots/04-playroom-current.png) | - **Dream Friend Maker** — create a ghost, cloud, robot, alien, monster, or fantastical you.<br>- **Sleepers' Guestbook** — a live wish wall and visitor odometer.<br>- **Ask Lumi** — in-character dialogue, with a storybook fallback.<br>- **Constellation hunt** — five hidden stars unlock a secret.<br>- **90s Chaos Mode** — a responsive early-web alternate layout. |

## Interactive details

- Cursor-reactive Lumi, mood expressions, a Twilight/Midnight palette switch, and a visible mute control.
- Five Tier 2 interactions: Web Audio music box, Lantern Hide-and-Seek nightlight cursor, scroll-synced delivery flight, interactive storybook, and *Catch the Falling Dreams*.
- A procedural Three.js Lumi, local visitor memory, responsive mobile navigation, reduced-motion preview, a 90s webring, and classic web badges.
- Direct routes for every major destination: `/meet-lumi`, `/story`, `/workshop`, `/playroom`, `/dream-friends`, `/guestbook`, and `/goodnight`.

## How it fits the brief

| Brief requirement | LUMI |
| --- | --- |
| Original Track 2 character sheet | Lumi's identity, craft, story, and tagline appear in the site and above. |
| 3+ works | Dream Repair Lab, Moonlight Lantern Studio, and Dream Delivery Navigator. |
| Story through interaction | A four-chapter scroll-driven origin story plus a guided first-time journey. |
| Visitor reaction | Eye tracking, clicks, theme and mood controls, sound with a mute switch, and chat. |
| Mobile friendly + Easter egg | Responsive navigation and layouts; five hidden constellation stars. |

## Built to be shared safely

- **Guestbook:** durable limits, a honeypot, a minimum fill-in time, and gentle moderation protect the shared wish wall. Visitor IPs are stored only as salted hashes.
- **Ask Lumi:** durable per-visitor limits and a daily cap protect the AI budget. The UI shows whether Lumi is replying with AI or from the storybook fallback.
- **Quality checks:** [three mobile Lighthouse reports](docs/lighthouse) record Performance 86–94, Accessibility 100, Best Practices 100, and SEO 91–100. Playwright tests cover desktop and phone journeys, navigation, mute persistence, core interactions, offline fallbacks, and console errors.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS · Three.js · Web Audio API · HTML5 Canvas · Netlify Functions + Blobs · Anthropic SDK

Below-the-fold sections and the 3D viewer load on demand. The experience saves progress locally, while the deployed version uses Netlify Functions and Blobs for the shared guestbook and odometer.

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
npm run lighthouse
```

## Credits

- **Character, writing, and art:** Lumi and Workshop No. 07 are original creations for haX.baby. Artwork is hand-built SVG, CSS, Canvas, and Three.js—no stock art or existing characters.
- **Audio:** Original procedural chimes and Lumi's Lullaby generated in-browser with the Web Audio API.
- **Fonts:** Fraunces, Fredoka, and Nunito via Google Fonts (SIL Open Font License).
- **Libraries and services:** React, Vite, TypeScript, Tailwind CSS, Three.js, Lucide React, canvas-confetti, Netlify, and Claude by Anthropic.
- **AI assistance:** Built with help from AI coding assistants; reviewed and tested by the author.
