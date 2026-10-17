import React, { useEffect, useRef, useState } from 'react';
import { useAtelier } from '../context/AtelierContext';

// Responsive Chaos Mode: a 90s homepage skin that re-lays itself out for every screen size.
// The current "tier" is written to <html data-chaos-tier> so CSS (animations.css) can reshape
// the page, and a marquee reports the live screen size back to the visitor.

type Tier = 'pocket' | 'flip' | 'desk' | 'mega' | 'jumbo';

const TIER_NAMES: Record<Tier, string> = {
  pocket: 'Pocket Pager',
  flip: 'Flip Phone',
  desk: 'Desk Lamp',
  mega: 'Mega Monitor',
  jumbo: 'Jumbotron',
};

const tierFor = (w: number): Tier => (w < 480 ? 'pocket' : w < 768 ? 'flip' : w < 1280 ? 'desk' : w < 1920 ? 'mega' : 'jumbo');

export const ChaosMode: React.FC = () => {
  const { prefs, lumiSay } = useAtelier();
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const lastTier = useRef<Tier | null>(null);
  const tier = tierFor(size.w);

  useEffect(() => {
    if (!prefs.chaosMode) return;
    let frame = 0;
    const onResize = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setSize({ w: window.innerWidth, h: window.innerHeight });
      });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [prefs.chaosMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (!prefs.chaosMode) {
      delete root.dataset.chaosTier;
      lastTier.current = null;
      return;
    }
    root.dataset.chaosTier = tier;
    // Lumi notices when the screen changes shape (not on the first switch-on).
    if (lastTier.current && lastTier.current !== tier) {
      lumiSay?.(`Whoosh! I rearranged the furniture for your ${TIER_NAMES[tier]} screen.`, 'celebrating');
    }
    lastTier.current = tier;
  }, [prefs.chaosMode, tier, lumiSay]);

  if (!prefs.chaosMode) return null;

  const message = `✦ WELCOME 2 LUMI'S HOMEPAGE ✦ you are surfing in ${TIER_NAMES[tier].toUpperCase()} mode (${size.w}×${size.h}) ✦ resize ur window & watch the page rearrange!! ✦ best viewed in ANY browser ✦ sign my guestbook ✦ under construction 🚧 forever ✦ `;

  return (
    <div className="chaos-marquee" role="status" aria-live="polite" aria-label={`Chaos mode: ${TIER_NAMES[tier]} layout, ${size.w} by ${size.h}`}>
      <div className="chaos-marquee-track" aria-hidden="true">
        <span>{message}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};
