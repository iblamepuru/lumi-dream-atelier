import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { playChime } from '../utils/soundEngine';

interface SoundToggleProps {
  className?: string;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const { state, toggleMute } = useAtelier();

  const handleToggle = () => {
    const nextMuted = !state.isMuted;
    toggleMute();
    if (!nextMuted) {
      // Play a gentle introductory chime when unmuted
      setTimeout(() => {
        playChime(false, 659.25); // E5 note
      }, 50);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={!state.isMuted}
      aria-label={state.isMuted ? 'Turn on story sound effects' : 'Mute story sound effects'}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 select-none ${
        state.isMuted
          ? 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)]'
          : 'border-[#F4C96B]/60 bg-[#F4C96B]/15 text-[var(--text-primary)] shadow-[0_0_12px_rgba(244,201,107,0.3)]'
      } ${className}`}
    >
      {state.isMuted ? (
        <>
          <VolumeX className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
          <span>Muted</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[var(--accent-gold)] animate-pulse" />
          <span className="font-semibold text-[var(--text-primary)]">Sound On</span>
          {/* Subtle animated sound bars */}
          <span className="inline-flex items-center gap-0.5 ml-0.5" aria-hidden="true">
            <span className="w-0.5 h-2 bg-[var(--accent-gold)] rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-[var(--accent-gold)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-1.5 bg-[var(--accent-gold)] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </span>
        </>
      )}
    </button>
  );
};
