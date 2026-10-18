import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { playWhoosh } from '../utils/soundEngine';
import { LumiCharacter } from './LumiCharacter';
import type { LumiMood } from '../types/atelier';

// "Lumi and the Little Light": an interactive picture book with 3D page turns.
// Desktop shows a two-page spread; phones turn one page at a time. Works with buttons,
// the arrow keys, swipes and taps; flips instantly when reduced motion is on.

interface Page {
  text: string;
  art: React.ReactNode;
}

const Art = {
  lumi: (mood: LumiMood, extra?: React.ReactNode) => (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32">
      <LumiCharacter mood={mood} size="100%" enableEyeTracking={false} />
      {extra}
    </div>
  ),
  observatory: (
    <svg viewBox="0 0 120 100" className="w-32 h-28" aria-hidden="true">
      <path d="M10 92 C10 74 32 66 46 74 C54 58 80 58 88 72 C102 66 116 78 112 92 Z" fill="#d9ccf2" />
      <rect x="38" y="52" width="44" height="24" rx="3" fill="#b9a5e8" />
      <path d="M34 54 A26 26 0 0 1 86 54 Z" fill="#d6a85a" />
      <rect x="56" y="30" width="8" height="24" fill="#8a6d3f" />
      <rect x="60" y="20" width="34" height="8" rx="4" transform="rotate(-30 60 24)" fill="#8f78c8" />
      <rect x="46" y="60" width="9" height="10" rx="4.5" fill="#ffd98a" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 120 100" className="w-32 h-28" aria-hidden="true">
      <ellipse cx="60" cy="86" rx="44" ry="9" fill="#bfe3d0" />
      <circle cx="60" cy="54" r="34" fill="#f4c96b" opacity="0.18" />
      <path d="M60 22 L68 46 L94 50 L74 66 L80 90 L60 76 L40 90 L46 66 L26 50 L52 46 Z" fill="#f4c96b" />
      <path d="M52 58 q4 4 8 0 M62 58 q4 4 8 0" stroke="#5c4033" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  ),
  crystal: (
    <svg viewBox="0 0 120 100" className="w-32 h-28" aria-hidden="true">
      <path d="M60 8 L84 34 L60 92 L36 34 Z" fill="#c9b8f5" stroke="#fff8f1" strokeWidth="2" />
      <path d="M36 34 L84 34 M60 8 L60 92" stroke="#f4c96b" strokeWidth="2.5" strokeDasharray="4 3" />
      <circle cx="60" cy="40" r="44" fill="#f4c96b" opacity="0.1" />
    </svg>
  ),
  journey: (
    <svg viewBox="0 0 120 100" className="w-32 h-28" aria-hidden="true">
      <path d="M12 84 C 30 40, 60 70, 76 36 S 104 22, 110 14" stroke="#f4c96b" strokeWidth="3" strokeDasharray="5 5" fill="none" />
      <circle cx="12" cy="84" r="6" fill="#b9a5e8" />
      <circle cx="76" cy="36" r="6" fill="#d995b7" />
      <circle cx="110" cy="14" r="6" fill="#a8d8f0" />
    </svg>
  ),
};

const PAGES: Page[] = [
  { text: 'Lumi and the Little Light', art: Art.lumi('happy') },
  { text: 'Once, high above the clouds, a tiny moon moth named Lumi kept a workshop inside an old brass observatory.', art: Art.observatory },
  { text: 'One night a star tumbled into the moss, grey and silent. Lumi lifted a little lantern, and its warmth woke the star.', art: Art.star },
  { text: 'The star, Polara, glowed again, and moved into Lumi’s lantern to light the way home.', art: Art.lumi('celebrating') },
  { text: 'But dreams were breaking in the night wind. So Lumi learned to mend them with threads of moonlight.', art: Art.crystal },
  { text: 'Every night Lumi flies the mended dreams home: to cloud gardens, sleepy lighthouses and valleys of moonflowers.', art: Art.journey },
  { text: 'When the sun peeks up, Lumi curls up in the observatory, smiling. Even the smallest light can rescue a dream.', art: Art.lumi('sleepy') },
  { text: 'The End ✦ Goodnight, little dreamer.', art: Art.lumi('happy') },
];

const PageFace: React.FC<{ page?: Page; index: number; cover?: boolean }> = ({ page, index, cover }) => (
  <div
    className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 sm:p-7 text-center rounded-r-xl rounded-l-sm overflow-hidden shadow-xl ${
      cover ? 'bg-gradient-to-br from-[#3a2c6e] to-[#241a3e] text-[#FFF8F1]' : 'bg-[#fff8f1] text-[#3b2a3f]'
    }`}
    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
  >
    {page && (
      <>
        {page.art}
        <p className={cover ? 'font-serif font-bold text-xl sm:text-2xl leading-snug' : 'font-serif text-sm sm:text-base leading-relaxed'}>{page.text}</p>
        {!cover && <span className="absolute bottom-2 text-[10px] font-mono opacity-50">{index + 1}</span>}
      </>
    )}
  </div>
);

export const BedtimeStorybook: React.FC = () => {
  const { state } = useAtelier();
  const reducedMotion = useReducedMotion();
  const [narrow, setNarrow] = useState(() => window.innerWidth < 640);
  const [flipped, setFlipped] = useState(0); // number of leaves turned
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Desktop: each leaf carries two pages (front + back). Phone: one page per leaf.
  const leaves = narrow
    ? PAGES.map((p, i) => ({ front: { page: p, index: i }, back: undefined }))
    : Array.from({ length: Math.ceil(PAGES.length / 2) }, (_, i) => ({
        front: { page: PAGES[i * 2], index: i * 2 },
        back: PAGES[i * 2 + 1] ? { page: PAGES[i * 2 + 1], index: i * 2 + 1 } : undefined,
      }));
  const turned = Math.min(flipped, leaves.length - (narrow ? 1 : 0));

  const go = (delta: number) => {
    const next = Math.max(0, Math.min(leaves.length - (narrow ? 1 : 0), turned + delta));
    if (next === turned) return;
    setFlipped(next);
    playWhoosh(state.isMuted);
  };

  const visiblePages = narrow
    ? [turned]
    : [turned * 2 - 1, turned * 2].filter((i) => i >= 0 && i < PAGES.length);
  const status = `Page ${visiblePages.map((i) => i + 1).join(' and ')} of ${PAGES.length}: ${visiblePages.map((i) => PAGES[i].text).join(' ')}`;

  return (
    <section id="storybook" aria-labelledby="storybook-heading" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>The Bedtime Storybook</span>
        </div>
        <h2 id="storybook-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
          Read it before sleep
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Turn the pages with the arrows, your keyboard, a swipe or a tap.</p>
      </div>

      <div
        tabIndex={0}
        role="group"
        aria-roledescription="book"
        aria-label="Lumi and the Little Light. Use the left and right arrow keys to turn pages."
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(-1);
          }
        }}
        onPointerDown={(e) => {
          touchStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (touchStart.current === null) return;
          const dx = e.clientX - touchStart.current;
          touchStart.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
        className="relative mx-auto select-none touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-gold)] rounded-2xl"
        // On phones turned pages swing off to the left, so clip them; the spread needs both sides visible.
        style={{ width: narrow ? 'min(100%, 340px)' : 'min(100%, 760px)', aspectRatio: narrow ? '3 / 4' : '760 / 470', perspective: '2000px', overflow: narrow ? 'hidden' : 'visible' }}
      >
        {!narrow && <div className="absolute inset-y-0 left-1/2 w-px bg-[#3b2a3f]/20 z-[100] pointer-events-none" aria-hidden="true" />}
        {leaves.map((leaf, i) => {
          const isTurned = i < turned;
          return (
            <div
              key={`${narrow}-${i}`}
              className="absolute top-0 h-full"
              style={{
                left: narrow ? 0 : '50%',
                width: narrow ? '100%' : '50%',
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${isTurned ? -180 : 0}deg)`,
                transition: reducedMotion ? 'none' : 'transform 0.9s cubic-bezier(0.645, 0.045, 0.355, 1)',
                zIndex: isTurned ? i : leaves.length - i,
              }}
              onClick={() => go(isTurned ? -1 : 1)}
            >
              <PageFace page={leaf.front.page} index={leaf.front.index} cover={leaf.front.index === 0 || leaf.front.index === PAGES.length - 1} />
              <div className="absolute inset-0" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                <PageFace page={leaf.back?.page} index={leaf.back?.index ?? 0} cover={leaf.back?.index === PAGES.length - 1} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={turned === 0}
          aria-label="Previous page"
          className="w-11 h-11 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] disabled:opacity-40 inline-flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="text-xs font-bold text-[var(--text-muted)] min-w-[7rem] text-center" aria-live="polite">
          <span className="sr-only">{status}</span>
          <span aria-hidden="true">
            {visiblePages.map((i) => i + 1).join('–')} / {PAGES.length}
          </span>
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={turned >= leaves.length - (narrow ? 1 : 0)}
          aria-label="Next page"
          className="w-11 h-11 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] disabled:opacity-40 inline-flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
