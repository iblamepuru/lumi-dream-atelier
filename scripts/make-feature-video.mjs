// Makes one narrated feature-tour video of the live site: every page from Home to Goodnight,
// every feature used on screen, with a spoken voiceover AND burned-in subtitles.
//
// Usage:  node scripts/make-feature-video.mjs            (or: npm run video:tour)
//         BASE_URL=http://localhost:5173 node scripts/make-feature-video.mjs
// Needs:  Windows (built-in speech voices, via scripts/tts.ps1), ffmpeg on PATH, Playwright + Chrome.
// Output: docs/videos/lumi-feature-tour.mp4  and  docs/videos/lumi-feature-tour.srt
//
// Note: the guestbook "Pin Wish" request is answered locally during recording, so making the
// video never posts a real wish to the public wall.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.BASE_URL || 'https://lumi-dream-atelier-hax.netlify.app').replace(/\/$/, '');
const OUT_DIR = 'docs/videos';
const OUT_MP4 = path.join(OUT_DIR, 'lumi-feature-tour.mp4');
const OUT_SRT = path.join(OUT_DIR, 'lumi-feature-tour.srt');
const WORK = path.resolve('node_modules/.cache/lumi-video');
const VIEW = { width: 1280, height: 720 };
const VOICE = process.env.TOUR_VOICE || 'Microsoft Zira Desktop';

// How the voice should pronounce things that read fine as subtitles.
const SAY_FIXES = [
  [/haX\.baby/g, 'hacks dot baby'],
  [/Three\.js/g, 'Three J S'],
  [/\b90s\b/g, 'nineties'],
  [/\b3D\b/g, 'three D'],
  [/No\. 07/g, 'Number Seven'],
  [/Web Audio API/g, 'Web Audio A P I'],
  [/\bLUMI\b/g, 'Lumi'],
  [/—/g, ', '],
];
const toSpeech = (t) => SAY_FIXES.reduce((s, [re, rep]) => s.replace(re, rep), t);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const report = [];

// ---------------------------------------------------------------------------------------------
// The tour. Each scene: a chapter title, the narration (also used as subtitles), and what to do.
// ---------------------------------------------------------------------------------------------
const STAR = '[aria-label$="(Hidden constellation star)"]';

const SCENES = [
  {
    title: 'LUMI · The Dream Repair Atelier',
    text: "Welcome to LUMI, The Dream Repair Atelier, built for haX.baby, Track 2: Your Own Baby. In this video we'll visit every page, from Home to the very last page, and try every feature along the way.",
    card: true,
    run: async (t) => {
      await t.card('<div class="k">haX.baby · Track 2 · Your Own Baby</div><h1>LUMI</h1><h2>The Dream Repair Atelier</h2><p>A full feature tour, from Home to Goodnight</p>');
    },
  },
  {
    title: 'Home · Meet the moth',
    text: 'This is the home page. Lumi is a tiny moon moth who mends broken dreams with moonlight thread and flies them home before sunrise. Watch her eyes: they follow your cursor wherever it goes. Click her, and her mood changes.',
    run: async (t) => {
      await t.card(null);
      const lumi = t.page.locator('#hero [aria-label^="Lumi the moon moth"]').first();
      await t.step('eyes follow the cursor', async () => {
        const b = await lumi.boundingBox();
        if (!b) throw new Error('Lumi not visible in hero');
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2, r = Math.max(b.width, b.height) * 0.9;
        for (let a = 0; a <= Math.PI * 2.2; a += Math.PI / 10) await t.page.mouse.move(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, { steps: 6 });
      });
      await t.step('click Lumi for a mood change', () => t.click(lumi));
      await wait(1200);
      await t.step('click Lumi again', () => t.click(lumi));
    },
  },
  {
    title: 'Header · Sound & theme',
    text: "Up in the header there's a mute switch. Sound always starts muted, and the site remembers your choice. Next to it, the Twilight and Midnight toggle changes the whole palette, and even Lumi's expression.",
    run: async (t) => {
      await t.step('point at the mute switch', () => t.hover(t.page.getByRole('button', { name: /^Muted|^Sound On/ }).first()));
      await wait(1500);
      const theme = () => t.page.getByRole('button', { name: /^Switch to (Twilight|Midnight) mode/ }).first();
      await t.step('switch theme', () => t.click(theme()));
      await wait(2600);
      await t.step('switch theme back', () => t.click(theme()));
    },
  },
  {
    title: 'Home · Hidden star 1 of 5',
    text: "Look closely at the moon. A hidden star is tucked into the sky. There are five of them across the site, and finding all five unlocks a secret.",
    run: async (t) => {
      await t.step('find the hero star', () => t.click(t.page.locator(`#hero ${STAR}`).first(), { force: true }));
    },
  },
  {
    title: "Home · Three answers & the journey",
    text: "Scrolling down, the home page tells the whole story in one long page. Three quick answers explain what Lumi is, what she does, and her story. The Start Lumi's Journey checklist guides first-time visitors through the best two-minute path, and a little flying Lumi keeps you company as you scroll.",
    run: async (t) => {
      await t.scrollBy(700, 2200);
      await wait(800);
      await t.step('show the journey checklist', () => t.glide(t.page.locator('#journey')));
    },
  },
  {
    title: 'Meet Lumi · Character sheet',
    text: "The Meet Lumi page holds the five point character sheet: her name, what she is, what she does, her story, and her tagline. Even the smallest light can rescue a dream.",
    run: async (t) => {
      await t.go('/meet-lumi');
      await wait(1200);
      await t.scrollBy(420, 2400);
    },
  },
  {
    title: 'Meet Lumi · Mood switcher',
    text: "The mood switcher changes Lumi's face: happy, curious, focused, sleepy, and full of joy.",
    run: async (t) => {
      for (const m of ['Curious', 'Focused', 'Sleepy', 'Joy', 'Happy']) {
        await t.step(`mood: ${m}`, () => t.click(t.page.locator('#profile').getByRole('button', { name: new RegExp(m) }).first()));
        await wait(700);
      }
    },
  },
  {
    title: 'Meet Lumi · 3D model & star 2',
    text: "Switch to 3D, and Lumi becomes a hand-built Three.js model. Drag to spin her around. Her lantern casts real light. And here is the second hidden star.",
    run: async (t) => {
      await t.step('open 3D Lumi', () => t.click(t.page.locator('#profile').getByRole('button', { name: /3D Lumi/ }).first()));
      await t.step('drag to orbit the 3D model', async () => {
        const canvas = t.page.locator('#profile canvas').first();
        await canvas.waitFor({ state: 'visible', timeout: 10000 });
        await wait(1200);
        const b = await canvas.boundingBox();
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        await t.page.mouse.move(cx, cy, { steps: 10 });
        await t.page.mouse.down();
        await t.page.mouse.move(cx + 220, cy - 20, { steps: 40 });
        await t.page.mouse.move(cx - 160, cy + 10, { steps: 50 });
        await t.page.mouse.up();
      });
      await wait(600);
      await t.step('find the profile star', () => t.click(t.page.locator(`#profile ${STAR}`).first(), { force: true }));
    },
  },
  {
    title: 'Story · Wake the fallen star',
    text: "The Story page tells Lumi's origin in four scroll-driven chapters. In chapter one, a fallen star has forgotten how to shine. Tap it, and Lumi's lantern wakes it up. Its name is Polara.",
    run: async (t) => {
      await t.go('/story');
      await wait(1000);
      await t.step('wake the star', () => t.click(t.page.getByRole('button', { name: /Sleeping gray star/ }).first()));
      await wait(1500);
    },
  },
  {
    title: 'Story · Gather the shards & star 3',
    text: "In the next chapter, gather the scattered crystal shards into Lumi's satchel. The chapters carry on to the brass observatory where she builds her workshop. A third hidden star lives in this story too.",
    run: async (t) => {
      await t.step('go to chapter 2', () => t.click(t.page.getByRole('button', { name: /^Go to chapter 2/ }).first()));
      await wait(1200);
      for (const s of ['Dawn', 'Starlight', 'Moonbeam']) {
        await t.step(`gather shard of ${s}`, () => t.click(t.page.getByRole('button', { name: new RegExp(`Crystal Shard of ${s}`) }).first()));
        await wait(500);
      }
      await t.step('find the story star', () => t.click(t.page.locator(`#story ${STAR}`).first(), { force: true }));
      await t.step('go to chapter 3', () => t.click(t.page.getByRole('button', { name: /^Go to chapter 3/ }).first()));
      await wait(1500);
      await t.step('go to chapter 4', () => t.click(t.page.getByRole('button', { name: /^Go to chapter 4/ }).first()));
    },
  },
  {
    title: 'Story · Bedtime storybook',
    text: "At the end is Lumi and the Little Light, a bedtime storybook with 3D page turns. It works with buttons, swipes and the arrow keys.",
    run: async (t) => {
      await t.step('scroll to the storybook', () => t.glide(t.page.locator('[aria-roledescription="book"]')));
      for (let i = 0; i < 3; i++) {
        await t.step(`turn page ${i + 1}`, () => t.click(t.page.getByRole('button', { name: 'Next page' })));
        await wait(1300);
      }
    },
  },
  {
    title: 'Workshop No. 07',
    text: "Now to Workshop No. 07, where you become Lumi's apprentice across three connected inventions: repair a dream, forge a lantern, and deliver it home.",
    run: async (t) => {
      await t.go('/workshop');
      await wait(1000);
      await t.scrollBy(500, 2500);
    },
  },
  {
    title: 'Workshop · Dream Repair Lab',
    text: "First, the Dream Repair Lab. Pick up each shard, Hope, Memory, Wonder and Courage, and place it in its matching slot to mend the broken dream crystal.",
    run: async (t) => {
      await t.go('/workshop/repair-lab');
      await wait(800);
      for (const [shard, facet] of [['Crown Shard', 'Hope'], ['Left Wing Shard', 'Memory'], ['Right Wing Shard', 'Wonder'], ['Core Heart Shard', 'Courage']]) {
        await t.step(`pick up ${shard}`, () => t.click(t.page.getByRole('button', { name: new RegExp(`^${shard}`) })));
        await wait(300);
        await t.step(`place it on ${facet}`, () => t.click(t.page.getByRole('button', { name: new RegExp(`^${facet}: target slot`) })));
        await wait(500);
      }
      await t.step('crystal mended (4/4)', () => t.page.getByText('Mended: 4/4 Facets').waitFor({ timeout: 5000 }));
    },
  },
  {
    title: 'Workshop · Moonlight Lantern Studio',
    text: "Next, the Moonlight Lantern Studio. Name your dream, choose a vessel shape, a glass colour and a core symbol, turn up the glow, and pick a twilight or midnight backdrop. Then create a keepsake card you can download as an image. The fourth hidden star is here.",
    run: async (t) => {
      const p = t.page;
      await t.go('/workshop/lantern-studio');
      await wait(800);
      await t.step('name the dream', async () => {
        const name = p.locator('#dream-name');
        await t.glide(name);
        await name.fill('');
        await name.pressSequentially('Flying over the sea', { delay: 55 });
      });
      for (const s of ['Astral Star', 'Moon Cradle']) {
        await t.step(`shape: ${s}`, () => t.click(p.getByRole('button', { name: new RegExp(s) }).first()));
        await wait(500);
      }
      await t.step('glass colour', async () => {
        const hues = p.locator('div.space-y-2').filter({ hasText: '3. Glass Hue' }).last().getByRole('button');
        await t.click(hues.nth(2));
        await wait(500);
        await t.click(hues.nth(1));
      });
      await t.step('core symbol: Comet', () => t.click(p.getByRole('button', { name: /Comet/ }).first()));
      await t.step('glow slider', async () => {
        const slider = p.locator('#glow-slider');
        await t.hover(slider);
        for (const v of ['60', '80', '100']) { await slider.fill(v); await wait(250); }
      });
      await t.step('midnight backdrop', () => t.click(p.getByRole('button', { name: 'Midnight', exact: true }).first()));
      await t.step('create keepsake card', () => t.click(p.getByRole('button', { name: /Create Dream Keepsake Card/ })));
      await wait(1500);
      await t.step('find the studio star', () => t.click(p.locator(STAR).filter({ visible: true }).first(), { force: true }));
    },
  },
  {
    title: 'Workshop · Dream Delivery flight',
    text: "Then the Dream Delivery Navigator. As you scroll, Lumi flies one continuous route across the map, lighting up each stop with its story.",
    run: async (t) => {
      await t.go('/workshop/delivery-map');
      await wait(800);
      await t.step('scroll-synced flight', async () => {
        const route = t.page.locator('#delivery-route');
        await t.glide(route);
        const end = await route.evaluate((el) => el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight);
        const start = await t.page.evaluate(() => window.scrollY);
        await t.scrollBy(Math.max(0, end - start), 7000);
      });
    },
  },
  {
    title: 'Workshop · Deliver the dreams & star 5',
    text: "You can also choose a sleeper and send the dream yourself. Lumi flies the lantern home to the Cloud Garden, the Sleeping Lighthouse and Moonflower Valley. The fifth and final hidden star is on this map.",
    run: async (t) => {
      const p = t.page;
      const tabs = p.getByRole('tablist', { name: 'Available Delivery Destinations' }).getByRole('tab');
      await t.step('scroll to the destinations', () => t.glide(tabs.first()));
      const n = Math.min(await tabs.count(), 3);
      for (let i = 0; i < n; i++) {
        await t.step(`choose destination ${i + 1}`, () => t.click(tabs.nth(i)));
        await t.step(`deliver dream ${i + 1}`, async () => {
          const btn = p.getByRole('button', { name: /^Deliver Dream to/ });
          if (await btn.count()) {
            await t.click(btn.first());
            await p.getByRole('button', { name: /^Delivered to/ }).first().waitFor({ timeout: 12000 });
          }
        });
        await wait(500);
      }
      await t.step('find the map star', () => t.click(p.locator(STAR).filter({ visible: true }).first(), { force: true }));
    },
  },
  {
    title: 'Playroom · Lullaby Lab',
    text: "The Night Playroom opens with the Lullaby Lab, a star-comb music box. Every tine plays a note made live with the Web Audio API, with no audio files at all. You can play Lumi's song, or record your own tune and replay it.",
    run: async (t) => {
      const p = t.page;
      await t.go('/playroom');
      await wait(800);
      await t.step('scroll to the music box', () => t.glide(p.locator('#lullaby-lab')));
      await t.step('record a tune', () => t.click(p.getByRole('button', { name: /^Record$/ })));
      for (const i of [1, 3, 5, 3, 1, 5, 8, 5]) {
        await t.step(`tine ${i}`, () => t.click(p.getByRole('button', { name: new RegExp(`^Star tine ${i},`) })));
        await wait(220);
      }
      await t.step('finish recording', () => t.click(p.getByRole('button', { name: /^Done \(/ })));
      await t.step('replay my tune', () => t.click(p.getByRole('button', { name: /My Tune/ })));
      await wait(3000);
    },
  },
  {
    title: 'Playroom · Lantern Hide-and-Seek',
    text: "Lantern Hide-and-Seek turns your cursor, your finger, or the arrow keys into Lumi's lantern. Sweep the light across the dark dream layer to find four sleeping dream friends.",
    run: async (t) => {
      const p = t.page;
      const dark = p.getByRole('application', { name: /Dark dream layer/ });
      await t.step('scroll to the dark layer', () => t.glide(dark));
      await t.step('find a friend with the arrow keys', async () => {
        await dark.focus();
        for (const key of ['ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowUp', 'ArrowUp']) { await p.keyboard.press(key); await wait(350); }
      });
      await t.step('sweep the lantern with the mouse', async () => {
        const b = await dark.boundingBox();
        for (const [fx, fy] of [[0.2, 0.7], [0.5, 0.5], [0.8, 0.3], [0.85, 0.75], [0.5, 0.85], [0.15, 0.3]]) {
          await p.mouse.move(b.x + b.width * fx, b.y + b.height * fy, { steps: 30 });
          await wait(250);
        }
      });
    },
  },
  {
    title: 'Playroom · Catch the Falling Dreams',
    text: "In Catch the Falling Dreams, steer Lumi to catch the dreams tumbling out of the sky. Every catch plays the next note of Lumi's lullaby.",
    run: async (t) => {
      const p = t.page;
      const area = p.getByRole('application', { name: 'Catch the Falling Dreams play area' });
      await t.step('scroll to the game', () => t.glide(area));
      await t.step('start catching', () => t.click(p.getByRole('button', { name: /Start catching|Play again/ })));
      await t.step('steer Lumi', async () => {
        const b = await area.boundingBox();
        const y = b.y + b.height * 0.85;
        for (let i = 0; i < 9; i++) {
          await p.mouse.move(b.x + b.width * (i % 2 ? 0.85 : 0.15), y, { steps: 45 });
        }
      });
    },
  },
  {
    title: 'Dream Friend Maker',
    text: "In the Dream Friend Maker, visitors sew their own companion: a ghost, a cloud, a robot, an alien, a monster, or a dreamy version of themselves. Choose a colour, a mood and an accessory, give it a name, and adopt it onto the nursery shelf.",
    run: async (t) => {
      const p = t.page;
      await t.go('/dream-friends');
      await wait(800);
      const fm = p.locator('#friend-maker');
      await t.step('scroll to the maker', () => t.glide(fm.getByRole('button', { name: /Friendly Ghost/ })));
      for (const k of ['Friendly Ghost', 'Sleepy Cloud', 'Baby Robot', 'Little Alien', 'Fuzzy Monster', 'Fantastical You', 'Baby Robot']) {
        await t.step(`kind: ${k}`, () => t.click(fm.getByRole('button', { name: new RegExp(k) }).first()));
        await wait(350);
      }
      await t.step('colour', () => t.click(fm.getByRole('button', { name: /^Colour / }).nth(3)));
      await t.step('mood: Wink', () => t.click(fm.getByRole('button', { name: 'Wink', exact: true })));
      await t.step('accessory: Star Crown', () => t.click(fm.getByRole('button', { name: 'Star Crown', exact: true })));
      await t.step('name the friend', async () => {
        const name = p.locator('#friend-name');
        await name.fill('');
        await name.pressSequentially('Bleep', { delay: 80 });
      });
      await t.step('adopt', () => t.click(fm.getByRole('button', { name: 'Adopt', exact: true })));
      await wait(1200);
    },
  },
  {
    title: "Sleepers' Guestbook",
    text: "The Sleepers' Guestbook is a live, shared wish wall with a mechanical visitor odometer. Write a bedtime wish and pin it to the wall. Behind the scenes it is protected by rate limits, a honeypot for bots, and gentle moderation.",
    run: async (t) => {
      const p = t.page;
      await t.go('/guestbook');
      await wait(1000);
      await t.step('write a wish', async () => {
        const name = p.getByLabel(/Your Name/i);
        await t.glide(name);
        await name.pressSequentially('Video Tour', { delay: 50 });
        await p.getByLabel(/Your Bedtime Wish/i).pressSequentially('May every little light find its way home tonight.', { delay: 30 });
      });
      await t.step('pin the wish', () => t.click(p.getByRole('button', { name: /Pin Wish/ })));
      await wait(1500);
      await t.scrollBy(450, 2000);
    },
  },
  {
    title: 'Ask Lumi · In-character chat',
    text: "From any page you can chat with Lumi. She answers in character, powered by Claude, and if the AI is ever unavailable she replies from her storybook instead.",
    run: async (t) => {
      const p = t.page;
      await t.step('open the chat', () => t.click(p.getByRole('button', { name: 'Open chat with Lumi' })));
      await wait(800);
      await t.step('ask a question', () => t.click(p.getByRole('button', { name: 'Why do dreams break?' }).first()));
      await wait(7000);
      await t.step('close the chat', () => t.click(p.getByRole('button', { name: 'Close chat with Lumi' })));
    },
  },
  {
    title: '90s Chaos Mode',
    text: "Click the lightning bolt for 90s Chaos Mode. The site becomes an early-web homepage with a scrolling marquee, classic badges and a webring, and it rearranges itself for every screen size.",
    run: async (t) => {
      const p = t.page;
      await t.go('/');
      await wait(800);
      await t.step('turn on chaos mode', () => t.click(p.getByRole('button', { name: 'Turn on 90s chaos mode' })));
      await wait(2500);
      await t.scrollBy(900, 3000);
      await t.step('show the badges and webring', () => t.glide(p.getByRole('navigation', { name: "Lumi's webring" }).first()));
      await wait(2000);
      await t.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await wait(1200);
      await t.step('turn off chaos mode', () => t.click(p.getByRole('button', { name: 'Turn off 90s chaos mode' })));
    },
  },
  {
    title: 'Goodnight · The last page',
    text: "The last page is Goodnight, the ending of Lumi's story, where every mended dream is home and glowing.",
    run: async (t) => {
      await t.go('/goodnight');
      await wait(1200);
      await t.scrollBy(500, 3000);
    },
  },
  {
    title: 'Goodnight · The secret constellation',
    text: "Because we found all five hidden stars, the secret constellation is complete. It unlocks a page from Lumi's secret diary, and a golden crown.",
    run: async (t) => {
      await t.step('scroll to the constellation', () => t.glide(t.page.locator('#constellation')));
      await wait(1500);
      await t.step('show the diary entry', () => t.glide(t.page.getByText('Secret Diary Entry Unlocked').first()));
    },
  },
  {
    title: 'Home · Journey complete & credits',
    text: "Back on the home page, the journey checklist has noticed everything we did. And the footer credits every font, library and service the site uses.",
    run: async (t) => {
      await t.go('/');
      await wait(1000);
      await t.step('show the finished checklist', () => t.glide(t.page.locator('#journey')));
      await wait(2500);
      await t.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
      await wait(2500);
    },
  },
  {
    title: 'Build Notes',
    text: "Finally, the Build Notes page explains how everything was made. LUMI works on phones, tablets and desktops, supports the keyboard throughout, and scores one hundred for accessibility on Lighthouse. Even the smallest light can rescue a dream. Goodnight!",
    run: async (t) => {
      await t.go('/build-notes');
      await wait(1200);
      await t.scrollBy(700, 4000);
    },
  },
  {
    title: 'Thank you',
    text: 'Thank you for watching.',
    card: true,
    run: async (t) => {
      await t.card('<h1>LUMI</h1><h2>Even the smallest light can rescue a dream.</h2><p>lumi-dream-atelier-hax.netlify.app</p><p class="s">github.com/iblamepuru/lumi-dream-atelier</p>');
      await wait(1500);
    },
  },
];

// ---------------------------------------------------------------------------------------------
// 1) Narration audio (Windows built-in voices, fully offline)
// ---------------------------------------------------------------------------------------------
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const wavDuration = (file) => {
  const b = fs.readFileSync(file);
  const byteRate = b.readUInt32LE(28);
  let o = 12;
  while (o < b.length - 8) {
    const id = b.toString('ascii', o, o + 4);
    const size = b.readUInt32LE(o + 4);
    if (id === 'data') return size / byteRate;
    o += 8 + size + (size % 2);
  }
  throw new Error(`No audio data in ${file}`);
};

console.log(`Speaking ${SCENES.length} narration lines with "${VOICE}"...`);
const jobs = SCENES.map((s, i) => ({ text: toSpeech(s.text), out: path.join(WORK, `line-${String(i).padStart(2, '0')}.wav`) }));
fs.writeFileSync(path.join(WORK, 'jobs.json'), JSON.stringify(jobs), 'utf8');
execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/tts.ps1', '-Manifest', path.join(WORK, 'jobs.json'), '-Voice', VOICE], { stdio: 'inherit' });
SCENES.forEach((s, i) => {
  s.wav = jobs[i].out;
  s.audio = wavDuration(s.wav);
});
const totalSpeech = SCENES.reduce((a, s) => a + s.audio, 0);
console.log(`Narration: ${totalSpeech.toFixed(1)}s across ${SCENES.length} scenes.`);

// Subtitle chunks: sentences grouped to ~120 characters, timed by their share of the spoken length.
const chunkText = (text) => {
  const sentences = text.split(/(?<=[.!?:])\s+/);
  const chunks = [];
  for (const s of sentences) {
    const last = chunks[chunks.length - 1];
    if (last && (last + ' ' + s).length <= 120) chunks[chunks.length - 1] = last + ' ' + s;
    else chunks.push(s);
  }
  return chunks;
};

// ---------------------------------------------------------------------------------------------
// 2) Record the tour with an on-page subtitle bar, chapter chip and visible cursor
// ---------------------------------------------------------------------------------------------
const browser = await chromium
  .launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  .catch(() => chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }));
const context = await browser.newContext({
  viewport: VIEW,
  deviceScaleFactor: 1,
  colorScheme: 'dark',
  recordVideo: { dir: WORK, size: VIEW },
});

// Never post a real wish to the public wall while recording: answer "Pin Wish" locally.
await context.route(/\/api\/guestbook/, async (route) => {
  const req = route.request();
  if (req.method() === 'POST' && !req.url().includes('visit=')) {
    const body = JSON.parse(req.postData() || '{}');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ wish: { id: `tour-${Date.now()}`, author: body.author, message: body.message, emotion: body.emotion || 'Hope', createdAt: Date.now() } }),
    });
  }
  return route.continue();
});

await context.addInitScript(() => {
  const css = `
  #__tour{position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:"Segoe UI",system-ui,sans-serif}
  #__tour_chip{position:absolute;top:14px;left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:999px;background:rgba(18,14,32,.82);border:1px solid rgba(244,201,107,.6);color:#F4C96B;font:600 15px/1.3 "Segoe UI",system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;opacity:0;transition:opacity .4s}
  #__tour_sub{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);max-width:82%;padding:10px 20px;border-radius:14px;background:rgba(10,8,20,.84);color:#FFF8F1;font:500 22px/1.35 "Segoe UI",system-ui,sans-serif;text-align:center;text-shadow:0 1px 2px #000;opacity:0;transition:opacity .25s}
  #__tour_cursor{position:absolute;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid #fff;background:rgba(244,201,107,.55);box-shadow:0 0 10px rgba(244,201,107,.9);transition:width .15s,height .15s,margin .15s}
  #__tour_cursor.down{width:34px;height:34px;margin:-17px 0 0 -17px;background:rgba(217,149,183,.7)}
  #__tour_card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;background:radial-gradient(ellipse at 50% 35%,#3a2c55 0%,#1a1430 55%,#0d0a18 100%);color:#FFF8F1;opacity:0;transition:opacity .8s}
  #__tour_card.on{opacity:1}
  #__tour_card h1{margin:0;font:800 96px/1 Georgia,serif;letter-spacing:.12em;color:#F4C96B;text-shadow:0 0 30px rgba(244,201,107,.6)}
  #__tour_card h2{margin:0;font:italic 500 34px/1.3 Georgia,serif}
  #__tour_card p{margin:8px 0 0;font:500 20px/1.4 "Segoe UI",sans-serif;color:#B9A5E8}
  #__tour_card p.s{margin:0;font-size:16px;color:#D995B7}
  #__tour_card .k{font:700 15px/1 "Segoe UI",sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#D995B7}`;
  const mount = () => {
    if (document.getElementById('__tour')) return;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const root = document.createElement('div');
    root.id = '__tour';
    root.innerHTML = '<div id="__tour_card"></div><div id="__tour_chip"></div><div id="__tour_sub"></div><div id="__tour_cursor"></div>';
    document.body.appendChild(root);
    const chip = root.querySelector('#__tour_chip');
    const sub = root.querySelector('#__tour_sub');
    const card = root.querySelector('#__tour_card');
    const cursor = root.querySelector('#__tour_cursor');
    window.__tourSet = (c, s) => {
      chip.textContent = c || '';
      chip.style.opacity = c ? '1' : '0';
      sub.textContent = s || '';
      sub.style.opacity = s ? '1' : '0';
      sessionStorage.setItem('__tour', JSON.stringify({ c, s }));
    };
    window.__tourCard = (html) => {
      if (html) { card.innerHTML = html; card.classList.add('on'); } else card.classList.remove('on');
      sessionStorage.setItem('__tour_card', html || '');
    };
    const saved = JSON.parse(sessionStorage.getItem('__tour') || 'null');
    if (saved) window.__tourSet(saved.c, saved.s);
    const savedCard = sessionStorage.getItem('__tour_card');
    if (savedCard) window.__tourCard(savedCard);
    const pos = JSON.parse(sessionStorage.getItem('__tour_pos') || '[640,360]');
    cursor.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      sessionStorage.setItem('__tour_pos', JSON.stringify([e.clientX, e.clientY]));
    }, true);
    window.addEventListener('mousedown', () => cursor.classList.add('down'), true);
    window.addEventListener('mouseup', () => setTimeout(() => cursor.classList.remove('down'), 120), true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
});

const page = await context.newPage();
page.setDefaultTimeout(7000);
const T0 = Date.now();
const now = () => (Date.now() - T0) / 1000;

const t = {
  page,
  async go(p) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  },
  async glide(locator) {
    await locator.first().evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(1100);
  },
  async scrollBy(dy, ms = 1500) {
    await page.evaluate(async ([dy, ms]) => {
      const start = window.scrollY, t0 = performance.now();
      await new Promise((done) => {
        const tick = (n) => {
          const k = Math.min((n - t0) / ms, 1);
          window.scrollTo(0, start + dy * (0.5 - Math.cos(k * Math.PI) / 2));
          k < 1 ? requestAnimationFrame(tick) : done();
        };
        requestAnimationFrame(tick);
      });
    }, [dy, ms]);
  },
  async hover(locator) {
    const el = locator.first();
    await el.evaluate((e) => e.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(450);
    const b = await el.boundingBox();
    if (!b) throw new Error('not visible');
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 22 });
  },
  async click(locator, opts = {}) {
    await t.hover(locator);
    await wait(180);
    await locator.first().click(opts);
  },
  async card(html) {
    await page.evaluate((h) => window.__tourCard?.(h), html);
  },
  async step(name, fn) {
    try {
      await fn();
      report.push(`  ok    ${name}`);
    } catch (e) {
      report.push(`  MISS  ${name}: ${String(e.message).split('\n')[0]}`);
    }
  },
};

const setSub = (c, s) => page.evaluate(([c, s]) => window.__tourSet?.(c, s), [c, s]).catch(() => {});

await t.go('/');
await wait(1500);
const srt = [];
let firstStart = null;

for (const [i, scene] of SCENES.entries()) {
  report.push(`Scene ${i + 1}: ${scene.title}`);
  console.log(`Scene ${i + 1}/${SCENES.length}: ${scene.title}`);
  if (scene.card) await scene.run(t).catch((e) => report.push(`  MISS  card: ${e.message}`));

  const start = now();
  if (firstStart === null) firstStart = start;
  scene.start = start;

  // Subtitles follow the voice, chunk by chunk, while the actions run.
  const chunks = chunkText(scene.text);
  const totalLen = chunks.reduce((a, c) => a + c.length, 0);
  let offset = 0;
  const timed = chunks.map((c) => {
    const d = (c.length / totalLen) * scene.audio;
    const item = { text: c, from: start + offset, to: start + offset + d };
    offset += d;
    return item;
  });
  srt.push(...timed);
  const subs = (async () => {
    for (const c of timed) {
      const delay = (c.from - now()) * 1000;
      if (delay > 0) await wait(delay);
      await setSub(scene.card ? '' : scene.title, c.text);
    }
  })();

  const actions = scene.card ? Promise.resolve() : scene.run(t).catch((e) => report.push(`  MISS  scene crashed: ${e.message}`));
  await Promise.all([actions, subs, wait(scene.audio * 1000 + 700)]);
  scene.end = now();
}
await setSub('', '');
await wait(1200);

const video = page.video();
await page.close();
await context.close();
await browser.close();
const raw = await video.path();

// ---------------------------------------------------------------------------------------------
// 3) Mix the narration onto the video, write MP4 + SRT
// ---------------------------------------------------------------------------------------------
const trim = Math.max(0, firstStart - 0.2);
const lead = 0.15; // the voice starts a hair after its subtitle appears
const inputs = ['-y', '-ss', trim.toFixed(3), '-i', raw];
const filters = [];
SCENES.forEach((s, i) => {
  inputs.push('-i', s.wav);
  const ms = Math.round((s.start - trim + lead) * 1000);
  filters.push(`[${i + 1}:a]adelay=delays=${ms}:all=1[a${i}]`);
});
filters.push(`${SCENES.map((_, i) => `[a${i}]`).join('')}amix=inputs=${SCENES.length}:normalize=0:dropout_transition=0,apad[aout]`);

console.log('Mixing narration and encoding MP4...');
execFileSync('ffmpeg', [
  ...inputs,
  '-filter_complex', filters.join(';'),
  '-map', '0:v', '-map', '[aout]',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k',
  '-shortest', '-movflags', '+faststart',
  OUT_MP4,
], { stdio: ['ignore', 'ignore', 'inherit'] });

const stamp = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
fs.writeFileSync(
  OUT_SRT,
  srt.map((c, i) => `${i + 1}\n${stamp(c.from - trim + lead)} --> ${stamp(c.to - trim + lead)}\n${c.text}\n`).join('\n'),
  'utf8'
);

fs.writeFileSync(path.join(WORK, 'report.txt'), report.join('\n'), 'utf8');
console.log('\n' + report.join('\n'));
const misses = report.filter((l) => l.includes('MISS')).length;
console.log(`\nSaved ${OUT_MP4} and ${OUT_SRT}  (${misses} step(s) missed)`);
