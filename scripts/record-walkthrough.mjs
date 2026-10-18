import { chromium } from "playwright";
import { mkdir, rename } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BASE_URL || "https://lumi-dream-atelier-hax.netlify.app").replace(/\/$/, "");
const OUT_DIR = "docs/videos";

await mkdir(OUT_DIR, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

console.log("Launching browser for video recording...");
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  recordVideo: {
    dir: OUT_DIR,
    size: { width: 1280, height: 720 },
  },
});

const page = await context.newPage();

async function smoothScroll(distance, durationMs = 1200) {
  await page.evaluate(
    async ({ distance, durationMs }) => {
      const start = window.scrollY;
      const startTime = performance.now();
      await new Promise((resolve) => {
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
          window.scrollTo(0, start + distance * ease);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    },
    { distance, durationMs }
  );
  await wait(300);
}

try {
  // 1. HOME & HERO
  console.log("1. Recording Home & Hero...");
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await wait(2000);

  // Eye tracking: move mouse around center
  await page.mouse.move(640, 320);
  await wait(400);
  await page.mouse.move(580, 280);
  await wait(400);
  await page.mouse.move(700, 300);
  await wait(400);
  await page.mouse.move(640, 320);
  await wait(500);

  // Click on Lumi
  const lumiHero = page.locator("button[aria-label*='Lumi'], [data-testid='lumi-hero'], main button").first();
  if (await lumiHero.isVisible().catch(() => false)) {
    await lumiHero.click();
    await wait(1200);
  }

  // Scroll slowly past journey checklist
  await smoothScroll(600, 1800);
  await wait(1000);
  await smoothScroll(600, 1800);
  await wait(1500);

  // 2. MEET LUMI & 3D MODEL
  console.log("2. Recording Meet Lumi & 3D Model...");
  await page.goto(BASE + "/meet-lumi", { waitUntil: "networkidle" });
  await wait(2000);

  // Click mood switcher buttons
  const moodButtons = page.locator("button").filter({ hasText: /Curious|Brave|Sleepy|Proud/i });
  const moodCount = await moodButtons.count();
  for (let i = 0; i < Math.min(moodCount, 3); i++) {
    await moodButtons.nth(i).click().catch(() => {});
    await wait(1200);
  }

  // Scroll down to 3D Lumi model
  await smoothScroll(800, 1800);
  await wait(1500);

  // Drag mouse to orbit 3D Lumi model
  const canvas3D = page.locator("canvas").first();
  if (await canvas3D.isVisible().catch(() => false)) {
    const box = await canvas3D.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      for (let offset = 0; offset <= 200; offset += 20) {
        await page.mouse.move(cx + offset, cy - offset * 0.2);
        await wait(60);
      }
      await page.mouse.up();
      await wait(1500);
    }
  }

  // 3. WORKSHOP NO. 07
  console.log("3. Recording Workshop No. 07...");
  await page.goto(BASE + "/workshop", { waitUntil: "networkidle" });
  await wait(2000);

  // Dream Repair Lab
  const repairButtons = page.locator("button").filter({ hasText: /repair|mend|align|piece|fragment|connect/i });
  if ((await repairButtons.count()) > 0) {
    await repairButtons.first().click().catch(() => {});
    await wait(1500);
  }

  // Scroll to Moonlight Lantern Studio
  await smoothScroll(700, 1600);
  await wait(1500);

  // Scroll down along Dream Delivery Navigator flight route
  await smoothScroll(900, 2200);
  await wait(1500);
  await smoothScroll(900, 2200);
  await wait(1500);

  // 4. NIGHT PLAYROOM
  console.log("4. Recording Night Playroom...");
  await page.goto(BASE + "/playroom", { waitUntil: "networkidle" });
  await wait(2000);

  // Play music box star-comb keys
  const musicKeys = page.locator("button").filter({ hasText: /★|⭐|tune|tine|star/i });
  const keyCount = await musicKeys.count();
  if (keyCount > 0) {
    for (let k = 0; k < Math.min(keyCount, 5); k++) {
      await musicKeys.nth(k).click().catch(() => {});
      await wait(600);
    }
  } else {
    // Click any buttons in playroom
    const anyPlayButtons = page.locator("main button");
    const count = await anyPlayButtons.count();
    for (let k = 0; k < Math.min(count, 4); k++) {
      await anyPlayButtons.nth(k).click().catch(() => {});
      await wait(600);
    }
  }
  await wait(1500);

  // 5. DREAM FRIEND MAKER
  console.log("5. Recording Dream Friend Maker...");
  await page.goto(BASE + "/dream-friends", { waitUntil: "networkidle" });
  await wait(2000);

  const friendOptions = page.locator("button").filter({ hasText: /Ghost|Cloud|Robot|Alien|Monster|stitch|sew/i });
  const friendCount = await friendOptions.count();
  for (let f = 0; f < Math.min(friendCount, 3); f++) {
    await friendOptions.nth(f).click().catch(() => {});
    await wait(1000);
  }
  await wait(1500);

  // 6. GUESTBOOK & 90s CHAOS MODE
  console.log("6. Recording Guestbook & Chaos Mode...");
  await page.goto(BASE + "/guestbook", { waitUntil: "networkidle" });
  await wait(2000);
  await smoothScroll(500, 1500);
  await wait(1500);

  // Toggle 90s Chaos Mode via lightning bolt in header
  const chaosToggle = page.getByRole("button", { name: /chaos|90s|⚡/i }).first();
  if (await chaosToggle.isVisible().catch(() => false)) {
    await chaosToggle.click();
    await wait(2500);
    await smoothScroll(400, 1500);
    await wait(2000);
  }

  console.log("Walkthrough finished successfully!");
} catch (err) {
  console.error("Recording error:", err);
}

const video = page.video();
await page.close();
await context.close();
await browser.close();

if (video) {
  const origPath = await video.path();
  const destPath = path.join(OUT_DIR, "walkthrough.webm");
  await rename(origPath, destPath);
  console.log(`\n✅ Video saved successfully to: ${destPath}`);
}
