import { useSyncExternalStore } from 'react';

// A tiny History-API router: real URLs (/story, /playroom, ...) with no extra packages.
// Netlify (netlify.toml) and the Vite dev server both serve index.html for these paths.

export interface PageInfo {
  path: string;
  label: string;
  title: string;
  blurb: string;
  sectionId: string;
}

// Order matters: it is the chapter order of Lumi's webring (prev / next links).
export const PAGES: PageInfo[] = [
  { path: '/', label: 'Home', title: 'The Whole Storybook', blurb: 'Every chapter on one long, cozy page.', sectionId: 'hero' },
  { path: '/meet-lumi', label: 'Meet Lumi', title: 'Meet Lumi', blurb: 'The 5-point character sheet, moods and the 3D moth.', sectionId: 'profile' },
  { path: '/story', label: 'Story', title: "Lumi's Origin Story", blurb: 'Four chapters, from a fallen star to Workshop No. 07.', sectionId: 'story' },
  { path: '/workshop', label: 'Workshop', title: 'The Workshop', blurb: 'Repair a dream, forge a lantern, deliver it home.', sectionId: 'projects' },
  { path: '/playroom', label: 'Playroom', title: 'The Night Playroom', blurb: 'The star-comb music box and Catch the Falling Dreams.', sectionId: 'playroom' },
  { path: '/dream-friends', label: 'Friends', title: 'Dream Friend Maker', blurb: 'Sew your own ghost, cloud, robot, alien, monster or dreamy you.', sectionId: 'friend-maker' },
  { path: '/guestbook', label: 'Guestbook', title: "Sleepers' Guestbook", blurb: 'Hang a bedtime wish on the shared wall.', sectionId: 'guestbook' },
  { path: '/goodnight', label: 'Goodnight', title: 'Goodnight', blurb: 'The ending, and the secret constellation.', sectionId: 'goodnight' },
];

export type ProjectTab = 'lab' | 'studio' | 'navigator';

// Each Workshop invention also has its own page, so a card click lands right on the task.
export const PROJECT_PAGES: { path: string; tab: ProjectTab; label: string; title: string; blurb: string }[] = [
  { path: '/workshop/repair-lab', tab: 'lab', label: 'Repair Lab', title: 'Dream Repair Lab', blurb: 'Mend the shattered dream crystal: Hope, Memory, Wonder and Courage.' },
  { path: '/workshop/lantern-studio', tab: 'studio', label: 'Lantern Studio', title: 'Moonlight Lantern Studio', blurb: 'Design a lantern for your dream and download its keepsake card.' },
  { path: '/workshop/delivery-map', tab: 'navigator', label: 'Delivery Map', title: 'Dream Delivery Navigator', blurb: 'Fly the mended dream home to three sleeping corners of the world.' },
];

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path) || '/';

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

export const usePath = () => useSyncExternalStore(subscribe, () => normalize(window.location.pathname), () => '/');

export const navigate = (to: string) => {
  const [path, hash] = to.split('#');
  const target = normalize(path || window.location.pathname);
  if (target !== normalize(window.location.pathname) || hash) {
    window.history.pushState(null, '', hash ? `${target}#${hash}` : target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  // Scrolling to the top (or to #section) happens in App once the new page has rendered.
};

/** Scroll to a section if it is on this page, otherwise open the page that holds it. */
export const goToSection = (sectionId: string) => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const page = PAGES.find((p) => p.sectionId === sectionId);
  const nested: Record<string, string> = { constellation: '/goodnight#constellation', 'dream-lab': '/workshop#dream-lab' };
  navigate(page ? page.path : nested[sectionId] ?? '/');
};
