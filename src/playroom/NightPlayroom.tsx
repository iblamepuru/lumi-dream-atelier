import React from 'react';
import { Moon } from 'lucide-react';
import { LullabyLab } from './LullabyLab';
import { CatchTheDreams } from './CatchTheDreams';

export const NightPlayroom: React.FC = () => {
  return (
    <section
      id="playroom"
      aria-labelledby="playroom-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10"
    >
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <Moon className="w-3.5 h-3.5" />
          <span>After-Hours in Workshop No. 07</span>
        </div>
        <h2 id="playroom-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)]">
          The Night Playroom
        </h2>
        <p className="text-base text-[var(--text-secondary)]">
          When the mending is done, Lumi winds up the music box and plays catch with the dreams that slip through.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <LullabyLab />
        <CatchTheDreams />
      </div>
    </section>
  );
};
