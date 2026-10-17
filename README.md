# LUMI — The Dream Repair Atelier
> *"Even the smallest light can rescue a dream."*

**Hackathon:** [haX.baby](https://hax.baby) — Baby's First Website  
**Track:** Track 2 — Original Character  
**Project Workspace:** `C:\BabyX`

---

## ✦ Project Overview

**LUMI — The Dream Repair Atelier** is an immersive, interactive storybook web application. It combines handcrafted cinematic storybook aesthetics, responsive bespoke SVG illustrations, tactile early-web whimsy, procedural Web Audio synthesizer tones, and persistent narrative progression.

High above the sleeping world, tucked inside an abandoned brass observatory dome among the clouds, lives **Lumi**, a gentle moon moth artisan. Every night, forgotten and fractured dreams drift across the sky as crystalline spheres. Some lose their color, some crack in the stratosphere wind, and others lose their way home. Lumi mends broken dream crystals with spun moonlight threads, shelters them inside custom magical lanterns, and guides them safely back to sleeping dreamers before sunrise.

---

## ✦ Hackathon Submission Blurb & Pitch Script

### Concise Submission Blurb (for Devpost / haX.baby submission form)
> **LUMI — The Dream Repair Atelier** is an original interactive bedtime-story world built for haX.baby (Track 2: Original Character). Step into Workshop No. 07 above the clouds with Lumi, a tiny moon moth with soft lavender wings and amber eyes. Visitors participate in a three-stage connected narrative: (1) mend a fractured 4-shard dream crystal in the **Dream Repair Lab**, (2) forge a custom celestial lantern with live lighting filters and export a keepsake dream card in the **Moonlight Lantern Studio**, and (3) guide Lumi across an illustrated cloud map in the **Dream Delivery Navigator** to deliver the restored dream before sunrise. Featuring 100% bespoke SVG art, bounded eye tracking, procedural Web Audio chimes, dual Twilight/Midnight themes, and a 5-star secret constellation Easter egg. A live shared guestbook and visitor odometer run on Netlify Functions + Netlify Blobs, and Ask Lumi chats in character via Claude (falling back to rule-based replies).

### 60-Second Video Pitch Script
```
[0:00 - 0:10] (Hero Scene - Midnight Theme)
"Every night while the world sleeps, dreams travel across the sky as fragile crystals. But what happens when a dream breaks? Meet Lumi—a tiny moon moth who repairs forgotten dreams before sunrise."

[0:10 - 0:25] (Character Profile & Origin Story)
"Lumi is our 100% original character—complete with responsive pupil eye tracking, knitted rose scarf, and brass star lantern. In our 4-chapter interactive story, you awaken a fallen star and inspect the artisanal inventions inside Workshop No. 07."

[0:25 - 0:40] (Three Connected Inventions)
"You become Lumi's apprentice across three interconnected projects:
First, mend a fractured dream crystal across Hope, Memory, Wonder, and Courage in the Dream Repair Lab.
Next, forge a custom celestial lantern in the Moonlight Lantern Studio—adjusting glow, choosing shapes, and downloading your personalized keepsake card.
Then, chart nocturnal flight paths across cloud spires in the Dream Delivery Navigator to deliver restored dreams to sleepers."

[0:40 - 0:50] (Easter Egg & Ending)
"Find all five hidden stars scattered across the atelier to unlock the Secret Constellation and Lumi's private keeper diary note. In our Final Goodnight scene, Lumi wears the Astral Crown and holds your custom lantern as starlight leads the dream home."

[0:50 - 1:00] (Closing)
"Built purely with React, Vite, TypeScript, Tailwind, SVG, and procedural Web Audio. Because even the smallest light can rescue a dream. Welcome to Lumi's Little Atelier."
```

---

## ✦ The 5-Point Official Character Bible

1. **Name:** Lumi
2. **What they are:** A tiny moon moth with soft lavender wings and amber eyes.
3. **What they do:** Repair forgotten dreams and guide them home.
4. **Their story:** Lumi discovered a fallen star that had forgotten how to shine, inspiring a lifelong mission to rescue broken dreams before sunrise.
5. **Tagline:** *"Even the smallest light can rescue a dream."*

### Character Profile Dossier
- **Profession:** Junior Dream Repairer (Workshop No. 07)
- **Home:** A miniature workshop inside an abandoned brass observatory dome above the clouds.
- **Personality:** Quietly brave • Curious & observant • Gentle & compassionate • Patient artisan • Slightly forgetful • Determined helper.
- **Special Ability:** Sees the hidden emotional hues inside dreams and seamlessly reknits shattered facets using spun starlight thread.
- **Weakness:** Lumi's brass lantern flickers and dims whenever a dreamer begins to lose hope.
- **Signature Objects:**
  - *Brass Star Lantern:* Houses a living ember of the first star Lumi ever saved.
  - *Dream Fragment Satchel:* Soft velvet pouch padded with dandelion down to carry loose crystal shards.
  - *Knitted Rose Scarf:* Hand-spun from cloud-thistle silk by an elder moon moth.
  - *Moon-Thread Needles:* Microscopic silver needles that weave pure moonlight across crystal seams.

---

## ✦ Feature Highlights & Architecture

### 1. Reusable `<LumiCharacter />` Component
- Parametric SVG character supporting moods: `'happy' | 'curious' | 'focused' | 'sleepy' | 'celebrating'`.
- Dynamic lantern colors (`gold`, `lavender`, `rose`, `ice`).
- Bounded pupil tracking: Pupils follow the pointer smoothly clamped strictly within a `±3.8px` radius via `requestAnimationFrame`—never escaping the eye sockets.
- Secret Golden Astral Crown unlocks when all 5 stars are discovered.

### 2. Connected 3-Stage Interactive Inventions
- **Project 1 — Dream Repair Lab:** Deterministic SVG crystal-mending puzzle with 4 geometric shards: Crown (Hope), Left Wing (Memory), Right Wing (Wonder), and Core Heart (Courage). Features drag/click and full keyboard accessibility (`Tab`, `Enter`/`Space`), gentle shake feedback for incorrect facets, golden moonlight seam animations, and celebratory confetti.
- **Project 2 — Moonlight Lantern Studio (Dream Lab):** Live SVG lantern customizer with vessel shapes (Classic Globe, Astral Star, Moon Cradle), colors, core symbols (Star, Moon, Petal, Comet), and luminance range slider (20% to 100%). Generates a personalized dream blessing and exports a keepsake PNG card using an offscreen HTML5 `<canvas>`.
- **Project 3 — Dream Delivery Navigator:** Illustrated SVG celestial flight map (`viewBox="0 0 800 450"`) featuring Lumi's Observatory (100, 340) and 3 sleeping realms: The Cloud Garden, The Sleeping Lighthouse, and The Moonflower Valley. Animates Lumi along bezier curves and reveals narrative sleeper vignettes.

### 3. Global Interactive Systems
- **Procedural Web Audio Engine:** Synthesizes pentatonic chimes, crystal snap harmonics, flight whooshes, and ascending sparkle arpeggios using native `AudioContext` oscillators. Starts muted by default and suppresses audio safely. Zero external MP3/WAV files required.
- **Lantern Light Field:** Dynamic radial illumination overlay (`pointer-events: none`) tracking pointer movement via CSS custom properties `--cursor-x` and `--cursor-y`.
- **Dual Storybook Themes:** Seamless toggle between **Twilight Mode** (warm cream, peach, and brown daybook) and **Midnight Mode** (deep plum and luminous golden night), persisted in `localStorage`.
- **5 Hidden Constellation Stars Easter Egg:**
  - `star-hero`: Tip of the crescent moon in the Hero sky.
  - `star-profile`: Near Lumi's satchel in the Character Profile.
  - `star-story`: Inside the observatory dome in Chapter 03.
  - `star-lab`: Beside the Starlight Lantern Press in the Workbench.
  - `star-map`: By the compass rose on the Celestial Map.
  - Unlocking all 5 reveals the glowing SVG constellation and Lumi's secret diary entry.

---

## ✦ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19 + TypeScript** | Component architecture and type-safe state contracts |
| **Vite 8** | Ultra-fast bundling, HMR, and production optimization |
| **Tailwind CSS v4** | Modern fluid design tokens and responsive utility classes |
| **Lucide React** | Clean, accessible iconography |
| **Canvas Confetti** | Celebratory particle bursts upon puzzle and milestone completion |
| **Web Audio API** | Native procedural audio synthesizer (zero external audio dependencies) |
| **HTML5 Canvas** | Client-side PNG keepsake card generator and download |
| **Inline SVGs** | 100% custom, lightweight vector art and animations |

---

## ✦ Local Development & Running the App

### Prerequisites
- Node.js (v18+ or v24+ recommended)
- npm (v9+ or v11+)

### Installation & Execution
```powershell
# Navigate to the workspace directory
cd C:\BabyX

# Install dependencies (already performed)
npm install

# Run the development server
npm run dev

# Run TypeScript typecheck
npx tsc --noEmit

# Build production bundle
npm run build

# Preview production build locally
npm run preview -- --port 4173
```

Open your browser at `http://localhost:4173/` (preview) or `http://localhost:5173/` (dev).

---

## ✦ Boss Level Upgrade — Tier 3 Legendary Features & Side Quests

In addition to the core storybook atelier, this build includes the **Legendary Tier 3** enhancements and early-web nostalgic side quests:

1. **3D WebGL / Three.js Interactive Character Viewer (`Lumi3DViewer.tsx`):**
   - Seamlessly toggle between **2D Storybook SVG** and **3D WebGL Canvas** directly in the Character Dossier.
   - Fully textured 3D mesh: soft cream body, ribbed abdomen, curved crescent antennae with star tips, knitted rose scarf, dual upper/lower wings with sine-flutter animation, and a brass star lantern with a glowing octahedron core that dynamically reacts to the active lantern color palette.
   - Pointer drag rotation, auto-rotate toggle, and responsive canvas resizing.
   - Replaced deprecated clock APIs with native `performance.now()` for clean 0-warning console logs.

2. **The Sleepers' Guestbook Wall (`DreamGuestbook.tsx`) — Side Quest (+2 pts):**
   - Community bedtime registry where dreamers leave wishes under emotion seals (*Hope, Wonder, Peace, Courage*).
   - Instant client-side persistence and celebration burst via `canvas-confetti`.

3. **Vintage Mechanical Hit Counter Odometer — Side Quest (+1 pt):**
   - Classic retro skeuomorphic split-digit mechanical odometer with dark-plum tumblers, amber LED glow, and embossed metal bezels tracking dreams delivered worldwide.

4. **In-Character Dialogue Companion (`LumiChat.tsx`):**
   - Floating dream companion docked in the bottom-right corner.
   - Speaks in Lumi's authentic apprentice voice, answering questions about starry constellations, why dreams break, moonlight thread, nightmare remedies, and bedtime recipes.
   - Quick prompt chips for instant exploration + freeform question input.

5. **Stardust Cursor Sparkle Trail (`SparkleTrail.tsx`) — Side Quest (+2 pts):**
   - 4-point golden and lavender particle star trail that gently floats behind user pointer gestures.
   - Fully accessible: automatically suppresses under `prefers-reduced-motion` and can be toggled on/off in the footer.

6. **Responsive Chaos Mode — Side Quest (+5 pts):**
   - Nostalgic side quest button in the footer that activates `.chaos-mode` with bouncy button scaling, playful borders, and glowing rainbow accents.

---

## ✦ Hackathon Judge Controls & Utilities

For easy judging and testing:
1. **2D / 3D Switch:** Located on the character portrait in the *Meet Lumi* dossier.
2. **Sparkle Trail Toggle:** Located in the footer (ON / OFF).
3. **Chaos Mode (+5 pts):** Located in the footer.
4. **Reduced Motion Preview:** Located in the footer to toggle and test accessibility with `force-reduced-motion` styles.
5. **Reset All Progress:** Located in the footer to reset all `localStorage` state to fresh defaults.
6. **Reset Constellation Stars:** Located in the Secret Constellation panel to test both the locked (with gentle clues) and unlocked states.
7. **Theme & Audio Toggles:** Permanently accessible in the top sticky navigation bar.

---

## ✦ Verified QA Audit Results (Chrome DevTools Protocol)

Automated headless Chrome CDP audit verified 100% pass across all tests:
- **Zero Horizontal Overflow:** Verified at `320px`, `375px`, `390px`, `768px`, `1024px`, and `1440px`.
- **Seamless Crystal Geometry:** Center shard point `(150,140)` verified with 0 gap / no hole.
- **Accessibility & Reduced Motion:** Tested and verified that `.animate-float-moth` halts immediately (`before=floatMoth, after=none`).
- **Interactive 3D WebGL:** Verified canvas initialization and rendering.
- **Sleepers' Guestbook & Odometer:** Verified wish submission and reactive odometer counter.
- **In-Character Dialogue:** Verified responses to bedtime queries.
- **Clean Console:** 0 errors and 0 warnings on page load and interaction.

---

*Crafted with starlight and moonlight thread for haX.baby Track 2.*
