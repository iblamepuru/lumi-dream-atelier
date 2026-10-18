# 🌙 LUMI — Hackathon Video Submission Script & Storyboard

**Track:** Track 2 — Your Own Baby (haX.baby)  
**Project:** LUMI — The Dream Repair Atelier  
**Live Site:** https://lumi-dream-atelier-hax.netlify.app/  
**Video File:** [`docs/videos/walkthrough.webm`](videos/walkthrough.webm)  
**Duration:** ~1:45 – 2:00 minutes  
**Format:** Screen recording + voiceover narration

---

## ⏱️ Video Timeline & Voiceover Script

### Scene 1: Introduction & The Character (0:00 – 0:25)
* **Visual on Screen:**
  - Start on Home Page (`/`) with the moonlit hero backdrop.
  - Move the cursor around Lumi's face — show her large amber eyes following the pointer.
  - Click on Lumi once to trigger her playful mood reaction.
  - Click the **Twilight / Midnight** toggle in the navigation header to show the palette and expression shift.
* **Voiceover:**
  > *"Hi everyone! This is LUMI — The Dream Repair Atelier, built for Track 2: 'Your Own Baby'.*  
  > *Lumi is an original character: a tiny, quietly brave moon moth with soft lavender wings, amber eyes, and a knitted rose scarf. Moths are drawn to light, but Lumi’s job is to carry it. As Junior Dream Repairer at Workshop No. 07, she mends broken dreams that drift across the night sky and flies them home before sunrise."*

---

### Scene 2: Meet Lumi & Procedural 3D Model (0:25 – 0:45)
* **Visual on Screen:**
  - Navigate to `/meet-lumi`.
  - Briefly show the character sheet (Name, Form, Craft, Story, Tagline: *"Even the smallest light can rescue a dream"*).
  - Click the mood switcher buttons (*Curious*, *Brave*, *Sleepy*) to show her facial expressions reacting.
  - Scroll down to the procedural **Three.js 3D Lumi model**.
  - Click and drag to orbit 360° around Lumi with her glowing brass lantern.
* **Voiceover:**
  > *"On the Meet Lumi page, you can explore her character sheet, test her expressions with the mood switcher, and interact with a procedural 3D model built from scratch in Three.js — complete with real-time orbit controls and a brass lantern that casts genuine light."*

---

### Scene 3: Workshop No. 07 (Tier 2 & Craft) (0:45 – 1:15)
* **Visual on Screen:**
  - Navigate to `/workshop`.
  - **Dream Repair Lab:** Click to repair the shattered dream crystal with glowing moonlight thread.
  - **Moonlight Lantern Studio:** Select a custom lantern frame and starlight color, then click *Download Keepsake Card* (shows the generated canvas card).
  - **Dream Delivery Navigator:** Scroll down smoothly along the SVG flight route. Show Lumi flying in sync with the scroll as each stop lights up.
* **Voiceover:**
  > *"In Workshop No. 07, you become Lumi's apprentice across three connected inventions:*  
  > *First, mend a shattered dream crystal in the Dream Repair Lab.*  
  > *Next, shelter it inside a custom lantern in the Moonlight Lantern Studio and download an illustrated keepsake card.*  
  > *Finally, fly the dream home across our scroll-synced Dream Delivery Navigator, tracing an SVG flight path across the sleeping world."*

---

### Scene 4: Night Playroom & Dream Friends (1:15 – 1:35)
* **Visual on Screen:**
  - Navigate to `/playroom`.
  - Tap several tines on the star-comb **Lullaby Lab** music box (Web Audio API synthesizes chimes live).
  - Briefly scroll down to show the **Lantern Hide-and-Seek** nightlight cursor or the falling dreams game.
  - Navigate to `/dream-friends` and click a couple of parts to stitch a custom dream friend.
* **Voiceover:**
  > *"The Night Playroom features Lullaby Lab — an original music box powered by the Web Audio API with zero external audio files. You can even compose and replay your own tunes.*  
  > *Visitors can also sew their own dream companions in the Dream Friend Maker and leave them safely on the nursery shelf."*

---

### Scene 5: Sleepers' Guestbook & 90s Chaos Mode (1:35 – 1:55)
* **Visual on Screen:**
  - Navigate to `/guestbook`. Show the mechanical odometer hit counter and live wish wall.
  - Click the **⚡ Chaos Mode** lightning toggle in the header.
  - Watch the entire site morph into a nostalgic 90s early-web layout with animated marquees, classic 88x31 badges, and a custom webring.
* **Voiceover:**
  > *"We built this with real old-web soul: a live Sleepers' Guestbook backed by Netlify Functions and Blobs with rate-limiting, a mechanical odometer, and an Ask Lumi AI chat.*  
  > *And with one click on the lightning bolt, Chaos Mode transforms the atelier into a responsive 90s homepage complete with webrings and retro badges."*

---

### Scene 6: Closing & Tech Polish (1:55 – 2:05)
* **Visual on Screen:**
  - Switch back to the home page or ending screen.
  - Show the 5-star constellation or credits in footer.
* **Voiceover:**
  > *"LUMI delivers all five Tier 2 interactions, procedural 3D graphics, 100 Accessibility and Best Practices Lighthouse scores, and zero console errors.*  
  > *Thank you for visiting Lumi's Atelier — remember, even the smallest light can rescue a dream!"*

---

## 🛠️ Recording & Playback

- **Automated Video Recording:** Run `npm run record:video` (saves directly to `docs/videos/walkthrough.webm`).
- **File Location:** `docs/videos/walkthrough.webm` (can be opened directly in Chrome/Edge, or converted to MP4 via ffmpeg: `npx -y fluent-ffmpeg -i docs/videos/walkthrough.webm docs/videos/walkthrough.mp4`).
- **Audio:** You can read the voiceover script above while playing the walkthrough video, or import both into tools like CapCut, Loom, Premiere, or DaVinci Resolve.
