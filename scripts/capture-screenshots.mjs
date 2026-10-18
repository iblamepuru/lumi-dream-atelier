// Captures fresh README screenshots of the live site on desktop, tablet and phone.
//
// Usage:
//   npm i -D playwright          (skip if already installed)
//   node scripts/capture-screenshots.mjs
//   BASE_URL=http://localhost:5173 node scripts/capture-screenshots.mjs   (to shoot a local build)
//
// Output: docs/screenshots/{desktop,tablet,mobile}/NN-name.png

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.BASE_URL || "https://lumi-dream-atelier-hax.netlify.app").replace(/\/$/, "");

const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  tablet: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, hasTouch: true },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true },
};

// [file name, route]
const PAGES = [
  ["01-hero", "/"],
  ["02-meet-lumi", "/meet-lumi"],
  ["03-story", "/story"],
  ["04-workshop", "/workshop"],
  ["05-playroom", "/playroom"],
  ["06-dream-friends", "/dream-friends"],
  ["07-guestbook", "/guestbook"],
  ["08-goodnight", "/goodnight"],
  ["09-build-notes", "/build-notes"],
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Scroll the whole page so lazy-loaded sections and the 3D viewer mount before the shot.
async function warmUp(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 180));
    }
    window.scrollTo(0, 0);
  });
  await wait(800);
}

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

for (const [device, opts] of Object.entries(DEVICES)) {
  const dir = `docs/screenshots/${device}`;
  await mkdir(dir, { recursive: true });

  const context = await browser.newContext({ ...opts, colorScheme: "dark" });
  const page = await context.newPage();

  for (const [name, route] of PAGES) {
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await wait(1200);
      await warmUp(page);
      // Above-the-fold shot (what a visitor sees first) ...
      await page.screenshot({ path: `${dir}/${name}.png` });
      // ... and a full-page shot for the long pages.
      await page.screenshot({ path: `${dir}/${name}-full.png`, fullPage: true });
      console.log(`ok   ${device} ${route}`);
    } catch (err) {
      console.warn(`FAIL ${device} ${route}: ${err.message}`);
    }
  }

  // Responsive Chaos Mode (the lightning-bolt toggle in the header).
  try {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await wait(1000);
    const toggle = page.getByRole("button", { name: /chaos|90s|⚡/i }).first();
    await toggle.click({ timeout: 4000 });
    await wait(1500);
    await page.screenshot({ path: `${dir}/10-chaos-mode.png` });
    console.log(`ok   ${device} chaos mode`);
  } catch {
    console.warn(`skip ${device} chaos mode (toggle not found; adjust the selector in this script)`);
  }

  await context.close();
}

await browser.close();
console.log("\nDone. Check docs/screenshots/ and delete any shot you don't love.");
