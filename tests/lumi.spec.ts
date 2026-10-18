import { test, expect, type Page } from '@playwright/test';

// The guestbook and chat backends only exist on Netlify. Answer them with "unavailable" so the
// tests exercise the offline fallbacks deterministically.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'offline in tests' }) })
  );
});

/** Collect uncaught errors and console errors, ignoring the deliberately unavailable /api calls. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if ((m.location().url || '').includes('/api/') || /status of 503/.test(m.text())) return;
    errors.push(`console: ${m.text()}`);
  });
  return errors;
}

const PAGES: [path: string, heading: RegExp][] = [
  ['/', /Some dreams/],
  ['/meet-lumi', /Meet Lumi the Moon Moth/],
  ['/story', /Lumi's Origin Story/],
  ['/workshop', /Three Connected Inventions/],
  ['/workshop/repair-lab', /Dream Repair Lab/],
  ['/workshop/lantern-studio', /Moonlight Lantern Studio/],
  ['/workshop/delivery-map', /Dream Delivery Navigator/],
  ['/playroom', /The Night Playroom/],
  ['/dream-friends', /The Dream Friend Maker/],
  ['/guestbook', /The Sleepers' Guestbook Wall/],
  ['/goodnight', /The Little Moth & The First Star/],
  ['/build-notes', /Build Notes/],
];

test('every page loads its own content with no console errors', async ({ page }) => {
  const errors = watchErrors(page);
  for (const [path, heading] of PAGES) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading }).first(), path).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('unknown addresses show the 404 page', async ({ page }) => {
  await page.goto('/no-such-dream');
  await expect(page.getByRole('heading', { name: /This dream got lost/ })).toBeVisible();
  await expect(page).toHaveTitle(/404/);
});

test('header navigation switches pages and updates the title', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Toggle mobile menu' }).click();
  await page.getByRole('link', { name: 'Playroom', exact: true }).first().click();
  await expect(page).toHaveURL(/\/playroom$/);
  await expect(page).toHaveTitle(/Night Playroom/);
  await expect(page.getByRole('heading', { name: /The Night Playroom/ })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test('the mute switch is visible and remembers its setting', async ({ page }) => {
  await page.goto('/');
  const muted = page.getByRole('button', { name: /^Muted/ });
  await expect(muted).toBeVisible();
  await muted.click();
  await expect(page.getByRole('button', { name: /^Sound On/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /^Sound On/ })).toBeVisible();
});

test('the dream crystal can be repaired and the journey checklist notices', async ({ page }) => {
  await page.goto('/workshop/repair-lab');
  for (const [shard, facet] of [
    ['Crown Shard', 'Hope'],
    ['Left Wing Shard', 'Memory'],
    ['Right Wing Shard', 'Wonder'],
    ['Core Heart Shard', 'Courage'],
  ]) {
    await page.getByRole('button', { name: new RegExp(`^${shard}`) }).click();
    await page.getByRole('button', { name: new RegExp(`^${facet}: target slot`) }).click();
  }
  await expect(page.getByText('Mended: 4/4 Facets')).toBeVisible();

  await page.goto('/');
  const journey = page.locator('#journey');
  await expect(journey.getByText(/1\/5/)).toBeVisible();
  await expect(journey.getByRole('link', { name: /Repair the dream crystal/ }).getByLabel('Done')).toBeVisible();
});

test('the guestbook falls back to this browser when the backend is unavailable', async ({ page }) => {
  await page.goto('/guestbook');
  await expect(page.getByText(/Offline · saved in this browser/i)).toBeVisible();
  await page.getByLabel(/Your Name/i).fill('Test Dreamer');
  await page.getByLabel(/Your Bedtime Wish/i).fill('May every little dreamer find their way home');
  await page.getByRole('button', { name: /Pin Wish/ }).click();
  await expect(page.getByText('May every little dreamer find their way home')).toBeVisible();
  await page.reload();
  await expect(page.getByText('May every little dreamer find their way home')).toBeVisible();
});

test('Ask Lumi still answers (storybook replies) when AI is unavailable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat with Lumi' }).click();
  await page.getByRole('button', { name: 'Why do dreams break?' }).first().click();
  await expect(page.getByText(/storybook right now/)).toBeVisible();
  await expect(page.locator('#lumi-chat-dialog').getByText(/waking worries/)).toBeVisible();
});

test('the bedtime storybook turns pages with the keyboard', async ({ page, isMobile }) => {
  await page.goto('/story');
  const book = page.locator('[aria-roledescription="book"]');
  await book.scrollIntoViewIfNeeded();
  await book.focus();
  await expect(page.locator('#storybook').getByText(isMobile ? '1 / 8' : '1 / 8')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#storybook').getByText(isMobile ? '2 / 8' : '2–3 / 8')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#storybook').getByText('1 / 8')).toBeVisible();
});

test('the nightlight lantern finds a hidden friend using only the arrow keys', async ({ page }) => {
  await page.goto('/playroom');
  const dark = page.getByRole('application', { name: /Dark dream layer/ });
  await dark.scrollIntoViewIfNeeded();
  await dark.focus();
  // From the centre: two steps left and three up lands the light on the dozing owl.
  for (const key of ['ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowUp', 'ArrowUp']) await page.keyboard.press(key);
  await expect(page.locator('#playroom').getByText('1/4 found')).toBeVisible();
});

test('scrolling the delivery flight delivers every dream', async ({ page }) => {
  await page.goto('/workshop/delivery-map');
  const route = page.locator('#delivery-route');
  await route.scrollIntoViewIfNeeded();
  const end = await route.evaluate((el) => el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight);
  for (let y = 0; y <= end; y += 400) await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.evaluate((v) => window.scrollTo(0, v), end);
  for (const stop of ['Cloud Garden', 'Sleeping Lighthouse', 'Moonflower Valley']) {
    await expect(route.locator('svg text', { hasText: `✓ ${stop}` })).toBeVisible();
  }
});
