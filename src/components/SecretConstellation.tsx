import React, { useEffect, useRef } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { playSparkle, playChime } from '../utils/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Lock, BookOpen } from 'lucide-react';

const STAR_HINTS: Record<string, { name: string; clue: string }> = {
  'star-hero': {
    name: 'The Moon-Tip Star',
    clue: 'Look closely at the golden horn of the giant crescent moon in the Hero sky.',
  },
  'star-profile': {
    name: 'The Satchel Shard Star',
    clue: 'Peeking out near Lumi’s cross-body dream fragment satchel in the Character Profile.',
  },
  'star-story': {
    name: 'The Observatory Cupola Star',
    clue: 'High in the observatory dome in Chapter 03 of the Origin Story.',
  },
  'star-lab': {
    name: 'The Workbench Anvil Star',
    clue: 'Resting right by the Starlight Lantern Press in the Project Workbench.',
  },
  'star-map': {
    name: 'The Astrolabe Compass Star',
    clue: 'Drifting near the brass compass rose on the Celestial Delivery Map.',
  },
};

export const SecretConstellation: React.FC = () => {
  const { state, resetStars } = useAtelier();
  const hasTriggeredUnlockedConfetti = useRef(false);

  const starCount = state.discoveredStars.length;
  const isUnlocked = starCount === 5;

  useEffect(() => {
    if (isUnlocked && !hasTriggeredUnlockedConfetti.current) {
      hasTriggeredUnlockedConfetti.current = true;
      playSparkle(state.isMuted);
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F4C96B', '#FFF8F1', '#D995B7', '#B9A5E8'],
        });
      } catch {
        // Fallback
      }
    } else if (!isUnlocked) {
      hasTriggeredUnlockedConfetti.current = false;
    }
  }, [isUnlocked, state.isMuted]);

  const handleReset = () => {
    resetStars();
    playChime(state.isMuted, 440);
  };

  return (
    <section
      id="constellation"
      aria-labelledby="constellation-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-2xl backdrop-blur-xl space-y-8 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C96B]" />
            <span>Section G · The Hidden Constellation Easter Egg</span>
          </div>
          <h2 id="constellation-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
            The Little Moth & The First Star
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Five secret stars are hidden across Lumi’s atelier. Discover them all to reveal the secret diary entry.
          </p>
        </div>

        {/* STAR SOCKETS DISCOVERY TRACKER */}
        <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Cosmic Discovery Progress:</span>
            <span className="text-[var(--accent-gold)] font-mono">{starCount}/5 Stars Found</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {Object.entries(STAR_HINTS).map(([starId], idx) => {
              const isFound = state.discoveredStars.includes(starId);
              return (
                <div
                  key={starId}
                  className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[90px] ${
                    isFound
                      ? 'border-[#F4C96B] bg-[#F4C96B]/15 shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)]/50 opacity-70'
                  }`}
                >
                  <span className="text-base mb-1">
                    {isFound ? (
                      <span className="text-[#F4C96B] drop-shadow-[0_0_8px_#F4C96B]">★</span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                    Star 0{idx + 1}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {isFound ? 'Discovered ✓' : 'Hidden'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Gentle Poetic Clues for Missing Stars */}
          {!isUnlocked && (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                ✦ Celestial Whispers (Gentle Hints):
              </span>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                {Object.entries(STAR_HINTS)
                  .filter(([id]) => !state.discoveredStars.includes(id))
                  .map(([id, info]) => (
                    <li key={id}>
                      <span className="font-semibold text-[var(--text-primary)]">{info.name}:</span>{' '}
                      {info.clue}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* UNLOCKED CONSTELLATION DISPLAY */}
        {isUnlocked ? (
          <div className="space-y-6 animate-float-gentle">
            {/* Glowing SVG Constellation Artwork */}
            <div className="h-64 sm:h-72 w-full rounded-2xl bg-[#140D22] border-2 border-[#F4C96B]/50 flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(#F4C96B_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

              <svg viewBox="0 0 500 240" className="w-full h-full p-4">
                <defs>
                  <filter id="star-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>

                {/* Golden Animated Constellation Lines */}
                <path
                  d="M 120 160 L 190 70 L 260 110 L 330 70 L 400 160 L 260 190 Z"
                  stroke="#F4C96B"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="rgba(244, 201, 107, 0.08)"
                  filter="url(#star-beam-glow)"
                />
                <line x1="260" y1="110" x2="260" y2="190" stroke="#F4C96B" strokeWidth="2" strokeDasharray="3 3" />

                {/* 5 Constellation Nodes */}
                {[
                  { x: 120, y: 160, label: 'Star-Hero' },
                  { x: 190, y: 70, label: 'Star-Story' },
                  { x: 260, y: 110, label: 'Star-Lab' },
                  { x: 330, y: 70, label: 'Star-Profile' },
                  { x: 400, y: 160, label: 'Star-Map' },
                  { x: 260, y: 190, label: 'Star-Heart' },
                ].map((node, i) => (
                  <g key={i}>
                    <circle cx={node.x} cy={node.y} r="8" fill="#F4C96B" opacity="0.4" className="animate-pulse-glow" />
                    <circle cx={node.x} cy={node.y} r="4.5" fill="#FFF8F1" stroke="#F4C96B" strokeWidth="1.5" />
                  </g>
                ))}

                <text x="250" y="225" fill="#F4C96B" fontSize="13" fontFamily="var(--font-serif)" fontWeight="bold" textAnchor="middle">
                  Constellation of the Little Moth & The First Star ✦
                </text>
              </svg>
            </div>

            {/* LUMI'S SECRET DIARY ENTRY (Strict Exact Text) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F4C96B]/15 via-[#D995B7]/15 to-[#B9A5E8]/15 border-2 border-[#F4C96B] shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                <BookOpen className="w-4 h-4 text-[#F4C96B]" />
                <span>Secret Diary Entry Unlocked</span>
              </div>

              {/* Exact secret diary quote */}
              <blockquote className="text-base sm:text-lg font-serif italic font-semibold text-[var(--text-primary)] leading-relaxed">
                "Secret Note from Workshop No. 07: The first star I ever repaired never actually left the sky—it stayed inside my lantern so no dream would ever have to travel in the dark alone."
              </blockquote>

              <p className="text-xs text-[var(--text-muted)] font-mono">
                ✦ Bonus Unlocked: Lumi now wears the Golden Astral Crown in the Final Goodnight scene!
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-[var(--text-muted)] italic">
              Find the remaining {5 - starCount} hidden stars across the sections to assemble the secret constellation!
            </p>
          </div>
        )}

        {/* Hackathon Judge / Testing Reset Button */}
        <div className="pt-4 flex justify-end border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Star Discovery (Judge Utility)</span>
          </button>
        </div>

      </div>
    </section>
  );
};
