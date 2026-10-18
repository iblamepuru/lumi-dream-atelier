import React, { useEffect, useRef, useState } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { playChime } from '../utils/soundEngine';
import { LumiCharacter } from './LumiCharacter';
import type { LumiMood } from '../types/atelier';

// A little Lumi who flies down the page with you: travels with your scroll position, sways as
// it flies, tilts toward the direction you're scrolling, and chats when tapped.

const LINES: Record<string, string> = {
  profile: "That's me! Tap the moods to see all my faces.",
  story: 'This is how it all began. Wake the fallen star!',
  projects: 'My workbench! Mend the crystal first, then build its lantern.',
  playroom: 'Try the music box. Every note fits, I promise.',
  'friend-maker': 'Sew a friend! I love the fuzzy monsters.',
  guestbook: 'Leave a wish on the wall for the sleepers tonight.',
  constellation: 'Psst… five stars are hiding on the pages. Look closely!',
  goodnight: 'Thank you for flying with me tonight, apprentice.',
};
const FALLBACK = 'Keep going! The next page of the story is just below.';

/** Which section is currently in the middle of the screen. */
const currentSection = () => {
  const mid = window.innerHeight / 2;
  for (const id of Object.keys(LINES)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) return id;
  }
  return null;
};

export const ScrollCompanion: React.FC = () => {
  const { state, lumiSay } = useAtelier();
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mood, setMood] = useState<LumiMood>('happy');

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let frame = 0;
    let lastY = window.scrollY;
    let tilt = 0;
    let y = 0;
    let shown = false;
    let restTimer = 0;

    const tick = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const progress = Math.min(1, scrollY / max);

      // Appear once the hero (with its big Lumi) has mostly scrolled away.
      const heroBottom = document.getElementById('hero')?.getBoundingClientRect().bottom ?? -1;
      const shouldShow = heroBottom < vh * 0.35 && scrollY > 120;
      if (shouldShow !== shown) {
        shown = shouldShow;
        setVisible(shouldShow);
      }

      // Travel from near the top to just above the chat button as the page scrolls.
      const targetY = vh * (0.16 + progress * 0.5);
      const velocity = scrollY - lastY;
      lastY = scrollY;
      const targetTilt = reducedMotion ? 0 : Math.max(-14, Math.min(14, velocity * 0.6));
      y += (targetY - y) * 0.18;
      tilt += (targetTilt - tilt) * 0.2;
      // Phones have no spare margin, so Lumi peeks in from the edge with a smaller sway.
      const narrow = window.innerWidth < 640;
      const sway = reducedMotion ? 0 : Math.sin(scrollY / 160) * (narrow ? 5 : 14) + (narrow ? 14 : 0);
      el.style.transform = `translate3d(${sway.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;

      if (Math.abs(velocity) > 2) {
        setMood('focused');
        window.clearTimeout(restTimer);
        restTimer = window.setTimeout(() => setMood('happy'), 450);
      }
      // Keep easing until it settles.
      if (Math.abs(targetY - y) > 0.5 || Math.abs(tilt) > 0.2) frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    y = window.innerHeight * 0.16;
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(restTimer);
    };
  }, [reducedMotion]);

  const handleTap = () => {
    const section = currentSection();
    playChime(state.isMuted, 880);
    setMood('celebrating');
    window.setTimeout(() => setMood('happy'), 900);
    lumiSay?.(section ? LINES[section] : FALLBACK, 'happy');
  };

  return (
    <div
      ref={wrapRef}
      className="fixed top-0 right-0 sm:right-5 z-30 will-change-transform transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={handleTap}
        tabIndex={visible ? 0 : -1}
        aria-label="Lumi is flying with you. Tap for a hint about this part of the page."
        className="relative block rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)]"
      >
        <span
          className="absolute inset-[-30%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,201,107,0.35) 0%, rgba(244,201,107,0) 65%)' }}
          aria-hidden="true"
        />
        <span className="block w-11 h-11 sm:w-20 sm:h-20 animate-float-moth">
          <LumiCharacter mood={mood} size="100%" lanternColor={state.lanternConfig.color} enableEyeTracking={visible} hasGoldenCrown={state.discoveredStars.length === 5} />
        </span>
      </button>
    </div>
  );
};
