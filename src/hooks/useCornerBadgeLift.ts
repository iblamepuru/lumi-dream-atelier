import { useEffect, useState } from 'react';

// Netlify injects a "Powered by Netlify" badge (iframe#nl-badge-frame) into the bottom-right
// corner of the live site. This reports how far floating UI should lift to sit above it.
const BADGE_ID = 'nl-badge-frame';
const GAP = 8;

const measure = (): number => {
  if (typeof document === 'undefined') return 0;
  const badge = document.getElementById(BADGE_ID);
  if (!badge) return 0;
  const rect = badge.getBoundingClientRect();
  const nearBottom = window.innerHeight - rect.bottom < 40;
  const nearRight = window.innerWidth - rect.right < 80;
  return rect.height > 0 && nearBottom && nearRight ? Math.round(window.innerHeight - rect.top + GAP) : 0;
};

export function useCornerBadgeLift(): number {
  const [lift, setLift] = useState(measure);

  useEffect(() => {
    const update = () => setLift(measure());
    // The badge arrives after the page loads, so watch for it being added or resized.
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true });
    window.addEventListener('resize', update);
    const late = window.setTimeout(update, 2500);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.clearTimeout(late);
    };
  }, []);

  return lift;
}
