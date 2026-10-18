# LUMI — The Dream Repair Atelier · haX.baby Submission

- **Track:** Track 2 — Your Own Baby (Original Character)
- **Live website:** https://lumi-dream-atelier-hax.netlify.app/
- **GitHub repository:** https://github.com/iblamepuru/lumi-dream-atelier
- **Full Feature Video Tour (Spoken Narration + Burned-in Subtitles):** docs/videos/lumi-feature-tour.mp4
- **Video Subtitles (SRT):** docs/videos/lumi-feature-tour.srt
- **Quick Walkthrough:** docs/videos/walkthrough.webm

---

## Story Behind Your Build

I wanted a character who feels like a bedtime story you can walk into. Lumi is a tiny moon moth who works the night shift: when dreams break and drift across the sky as cracked crystals, Lumi mends them with moonlight thread, tucks them into lanterns, and flies them home before sunrise. Moths are drawn to light, so it felt right that this one carries it, and the motto came from that idea: "Even the smallest light can rescue a dream."

The site is Lumi's portfolio, and every part of it answers the brief by doing rather than telling. You meet Lumi on a moonlit hero where the moth's eyes follow your cursor (and dozes off if you go quiet). The origin story unfolds in four scroll-driven chapters, from the night Lumi woke a fallen star to the dream of a lantern in every sleeping window. In the Workshop you become Lumi's apprentice across three connected inventions: repair a shattered dream crystal, design a lantern for it (and download a keepsake card), then fly it home on an illustrated delivery map. A "Start Lumi's journey" checklist on the home page walks that whole path in about two minutes.

I built all five Tier 2 interactions rather than one or two: the Lullaby Lab music box; a nightlight cursor (Lantern Hide-and-Seek, where a CSS mask turns your pointer, finger or arrow keys into Lumi's lantern over a dark dream layer); a Dream Delivery flight where Lumi travels an SVG route in sync with your scroll; "Lumi and the Little Light", a bedtime storybook with 3D page turns that works with swipes and the keyboard; and the Catch the Falling Dreams mini-game. For Tier 3, Lumi can be spun around as a hand-built Three.js model whose eyes follow you.

I'm proudest of the moments that make it feel like a real little corner of the old web. Lumi chats back in character (powered by Claude, with rule-based replies as a fallback), remembers you when you return, and reacts to almost everything you do. Every catch in the mini-game plays the next note of Lumi's lullaby, and a Dream Friend Maker lets visitors sew their own ghost, cloud, robot, alien, monster or dreamy version of themselves. The pages are linked by a 90s webring, there's a live guestbook with a mechanical odometer, a sparkle cursor, 88x31 badges, and a Chaos Mode that turns the site into a 90s homepage that rearranges itself for every screen size. Five hidden stars unlock a secret constellation and a golden crown.

Under the hood I cared about polish: zero console errors, full keyboard support, sound that starts muted with an always-visible switch, and mobile Lighthouse runs on 18 Oct scoring 82–94 Performance, 100 Accessibility, 100 Best Practices, and 91–100 SEO (reports in docs/lighthouse).

---

## Character Sheet (5 points)

1. **Name:** Lumi
2. **What they are:** A tiny moon moth with soft lavender wings, amber eyes and a knitted rose scarf. Quietly brave, curious and gentle, and a little forgetful. Quirks: hums lullabies slightly off-key while sewing, collects lost buttons in a thimble, and their antennae glow pink when embarrassed.
3. **What they do:** Junior Dream Repairer at Workshop No. 07. Lumi mends broken dream crystals with spun moonlight thread, builds lanterns to shelter them, and flies them home to sleepers before sunrise.
4. **Their story:** One night Lumi found a fallen star that had forgotten how to shine and warmed it back to life with a little brass lantern. That star, Polara, still glows inside the lantern today. Lumi now lives in a cosy workshop inside an abandoned brass observatory above the clouds, and dreams of becoming a Master Dream Keeper, with a lantern glowing in every sleeping window of the world.
5. **Tagline:** "Even the smallest light can rescue a dream."

---

## Credits

**Character, story & art**
- Lumi, Workshop No. 07 and all story text are original creations for haX.baby (Track 2).
- All artwork is original: hand-built SVG illustrations and night-sky backdrops, CSS effects, HTML5 Canvas games and keepsake cards, and a procedural Three.js 3D model of Lumi. No external images, stock art or existing characters.

**Audio**
- All sounds are generated live in the browser with the Web Audio API (no audio files). The music box and "Lumi's Lullaby" are original compositions.

**Fonts** (Google Fonts, SIL Open Font License)
- Fraunces, Fredoka, Nunito

**Open-source libraries**
- React, React DOM, Vite, TypeScript (MIT / Apache-2.0)
- Tailwind CSS (MIT)
- Three.js (MIT)
- Lucide React icons (ISC)
- canvas-confetti (ISC)
- oxlint (MIT) and Playwright (Apache-2.0), for linting and end-to-end tests

**Services**
- Hosting, serverless functions and guestbook storage: Netlify (Netlify Functions + Netlify Blobs)
- Ask Lumi chat: Claude by Anthropic, via the official Anthropic SDK (`@anthropic-ai/sdk`)

**AI tools**
- Built with help from AI coding assistants (Claude Code). All code was reviewed, tested and shipped by me.
