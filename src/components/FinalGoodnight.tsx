import React from 'react';
import { goToSection } from '../router';
import { useAtelier } from '../context/AtelierContext';
import { LumiCharacter } from './LumiCharacter';
import { playChime, playWhoosh } from '../utils/soundEngine';
import { RotateCcw, ArrowUp, Check, Moon } from 'lucide-react';

export const FinalGoodnight: React.FC = () => {
  const { state } = useAtelier();

  const handleReplayStory = () => {
    playWhoosh(state.isMuted);
    goToSection('story');
  };

  const handleReturnToAtelier = () => {
    playChime(state.isMuted, 523.25);
    goToSection('hero');
  };

  const hasAllStars = state.discoveredStars.length === 5;
  const isCrystalMended = state.crystalRepaired;
  const deliveryCount = state.deliveriesCompleted.length;

  return (
    <section
      id="goodnight"
      aria-labelledby="goodnight-heading"
      className="py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[var(--bg-card)] via-[var(--bg-primary)] to-[var(--bg-secondary)] border-2 border-[var(--border-glow)] shadow-2xl backdrop-blur-xl space-y-10 text-center relative overflow-hidden">
        
        {/* Soft Ambient Moon Halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F4C96B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="space-y-4 max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] bg-[var(--surface-badge)] border border-[var(--border-color)]">
            <Moon className="w-3.5 h-3.5 text-[#F4C96B]" />
            <span>The Last Page</span>
          </div>

          {/* Exact Headline */}
          <h2 id="goodnight-heading" className="text-3xl sm:text-5xl font-serif font-extrabold text-[var(--text-primary)] leading-tight">
            Every little light <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4C96B] via-[#D995B7] to-[#B9A5E8]">
              finds its way home.
            </span>
          </h2>

          {/* Exact Supporting Copy */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)]">
            Thank you for helping Lumi repair a dream tonight.
          </p>
        </div>

        {/* CINEMATIC BALCONY COMPOSITION */}
        <div className="relative py-8 flex flex-col items-center justify-center">
          
          {/* Starlight Path to Distant Window (SVG) */}
          <svg viewBox="0 0 400 120" className="w-full max-w-md h-24 mb-4 select-none opacity-80" aria-hidden="true">
            <defs>
              <linearGradient id="starlight-ribbon" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F4C96B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#D995B7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#B9A5E8" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path
              d="M 50 110 Q 150 40 280 80 T 380 20"
              stroke="url(#starlight-ribbon)"
              strokeWidth="3"
              strokeDasharray="6 4"
              fill="none"
              className="animate-pulse-glow"
            />
            {/* Distant Bedroom Window */}
            <rect x="375" y="10" width="16" height="20" rx="2" fill="#F4C96B" opacity="0.8" />
            <line x1="383" y1="10" x2="383" y2="30" stroke="#5C4033" strokeWidth="1" />
            <line x1="375" y1="20" x2="391" y2="20" stroke="#5C4033" strokeWidth="1" />
          </svg>

          {/* LUMI WITH VISITOR'S CUSTOM LANTERN */}
          <div className="relative z-10 animate-float-moth">
            <LumiCharacter
              mood={hasAllStars || deliveryCount === 3 ? 'celebrating' : 'happy'}
              size={290}
              lanternColor={state.lanternConfig.color}
              enableEyeTracking={true}
              hasGoldenCrown={hasAllStars}
            />
          </div>

          {/* Balcony Railing Silhouette */}
          <div className="w-full max-w-md h-3 border-t-2 border-b border-[var(--border-color)] mt-2 flex justify-around opacity-60">
            <span className="w-1 h-3 bg-[var(--border-color)]" />
            <span className="w-1 h-3 bg-[var(--border-color)]" />
            <span className="w-1 h-3 bg-[var(--border-color)]" />
            <span className="w-1 h-3 bg-[var(--border-color)]" />
            <span className="w-1 h-3 bg-[var(--border-color)]" />
          </div>
        </div>

        {/* SHARED PROGRESS SUMMARY (Strict Honesty, No False States) */}
        <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] max-w-2xl mx-auto space-y-4 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block text-center">
            Tonight's Apprenticeship Record · Workshop No. 07
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Dream Forged:</span>
              <span className="font-bold text-[var(--text-primary)]">
                {state.lanternConfig.dreamName || 'The Starlight Voyager'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Crystal Mended:</span>
              <span className={`font-bold flex items-center gap-1 ${isCrystalMended ? 'text-[#F4C96B]' : 'text-[var(--text-muted)]'}`}>
                {isCrystalMended ? <Check className="w-3.5 h-3.5" /> : null}
                {isCrystalMended ? '4/4 Facets Whole' : 'In Progress (0/4)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Deliveries Completed:</span>
              <span className={`font-bold ${deliveryCount === 3 ? 'text-[#B9A5E8]' : 'text-[var(--text-primary)]'}`}>
                {deliveryCount}/3 Sleeping Realms
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Constellation Stars:</span>
              <span className={`font-bold ${hasAllStars ? 'text-[#F4C96B]' : 'text-[var(--text-primary)]'}`}>
                {state.discoveredStars.length}/5 Found {hasAllStars && '✦'}
              </span>
            </div>
          </div>
        </div>

        {/* Closing Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleReplayStory}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Story</span>
          </button>

          <button
            type="button"
            onClick={handleReturnToAtelier}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--border-glow)] hover:bg-[var(--surface-badge)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Return to Atelier</span>
          </button>
        </div>

      </div>
    </section>
  );
};
