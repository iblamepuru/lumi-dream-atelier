import React, { useState } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { playSparkle, playChime } from '../utils/soundEngine';
import confetti from 'canvas-confetti';

interface HiddenStarProps {
  starId: 'star-hero' | 'star-profile' | 'star-story' | 'star-lab' | 'star-map';
  label: string;
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HiddenStar: React.FC<HiddenStarProps> = ({
  starId,
  label,
  hint = 'A faint cosmic glimmer...',
  className = '',
  style,
}) => {
  const { state, discoverStar } = useAtelier();
  const [justDiscovered, setJustDiscovered] = useState(false);
  const isFound = state.discoveredStars.includes(starId);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isFound) {
      discoverStar(starId);
      setJustDiscovered(true);
      playSparkle(state.isMuted);

      // Trigger a small localized confetti burst
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 24,
          spread: 45,
          origin: { x, y },
          colors: ['#F4C96B', '#FFF8F1', '#D995B7', '#B9A5E8'],
          ticks: 120,
        });
      } catch {
        // Confetti fallback
      }

      setTimeout(() => setJustDiscovered(false), 3000);
    } else {
      playChime(state.isMuted, 987.77); // Soft high note
    }
  };

  return (
    <div className={`relative inline-block ${className}`} style={style}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${label} ${isFound ? '(Discovered star)' : '(Hidden constellation star)'}`}
        title={isFound ? `Discovered: ${label}` : hint}
        className={`group relative flex items-center justify-center p-2 rounded-full transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-[#F4C96B] ${
          isFound ? 'scale-110' : 'hover:scale-125'
        }`}
      >
        {/* Glow halo */}
        <span
          className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
            isFound
              ? 'bg-[#F4C96B]/30 blur-md opacity-100 animate-pulse-glow'
              : 'bg-[#F4C96B]/15 blur-sm opacity-60 group-hover:opacity-100'
          }`}
        />

        {/* Star SVG */}
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          className={`relative z-10 transition-all duration-300 ${
            isFound
              ? 'text-[#F4C96B] drop-shadow-[0_0_8px_#F4C96B]'
              : 'text-[#F4C96B]/60 hover:text-[#F4C96B] animate-star-twinkle'
          }`}
          fill={isFound ? '#F4C96B' : 'currentColor'}
          stroke={isFound ? '#FFFDF8' : '#F4C96B'}
          strokeWidth="1.2"
        >
          <polygon points="12,2 14.8,8.2 21.6,8.8 16.4,13.4 17.9,20.2 12,16.8 6.1,20.2 7.6,13.4 2.4,8.8 9.2,8.2" />
        </svg>

        {/* Just Discovered Toast Pop */}
        {justDiscovered && (
          <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#29213F] px-2.5 py-1 text-xs font-semibold text-[#F4C96B] shadow-lg border border-[#F4C96B]/40 animate-bounce">
            ✦ Star Discovered!
          </span>
        )}
      </button>
    </div>
  );
};
