import React, { useState } from 'react';
import { goToSection } from '../router';
import { useAtelier } from '../context/AtelierContext';
import { DreamRepairLab } from '../projects/DreamRepairLab';
import { LanternStudio } from '../projects/LanternStudio';
import { DreamDeliveryNavigator } from '../projects/DreamDeliveryNavigator';
import { playChime } from '../utils/soundEngine';
import { Sparkles, Check, Wrench, Hammer, Compass, ArrowRight } from 'lucide-react';

export const ProjectShowcase: React.FC = () => {
  const { state } = useAtelier();
  const [activeProjectTab, setActiveProjectTab] = useState<'lab' | 'studio' | 'navigator'>('lab');

  const handleTabSelect = (tab: 'lab' | 'studio' | 'navigator') => {
    setActiveProjectTab(tab);
    playChime(state.isMuted, 659.25);
  };

  const isCrystalDone = state.crystalRepaired;
  const isCardDone = state.lanternConfig.cardCreated;
  const isDeliveryDone = state.deliveriesCompleted.length === 3;

  return (
    <section
      id="projects"
      aria-labelledby="workbench-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16"
    >
      {/* Workbench Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <Wrench className="w-3.5 h-3.5" />
          <span>Section E & F · Active Interactive Workbench</span>
        </div>
        <h2 id="workbench-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)]">
          Lumi's Three Connected Inventions
        </h2>
        <p className="text-base sm:text-lg text-[var(--text-secondary)]">
          Repair the crystal, house it in a magical lantern, and navigate its delivery into the night sky.
        </p>
      </div>

      {/* THREE DISTINCT INTERACTIVE PROJECT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Dream Repair Lab */}
        <div
          className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between backdrop-blur-sm ${
            activeProjectTab === 'lab'
              ? 'border-[#F4C96B] bg-[var(--bg-card)] shadow-xl scale-102'
              : 'border-[var(--border-color)] bg-[var(--bg-card)]/70 hover:border-[var(--border-glow)]'
          }`}
        >
          <div className="space-y-4">
            {/* Badge & Status */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-badge)] text-[var(--accent-gold)]">
                Invention 01
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isCrystalDone
                    ? 'border-[#F4C96B]/50 bg-[#F4C96B]/20 text-[var(--accent-gold)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                {isCrystalDone ? (
                  <>
                    <Check className="w-3 h-3 text-[#F4C96B]" />
                    <span>✦ Restored</span>
                  </>
                ) : (
                  <span>Ready to Start</span>
                )}
              </span>
            </div>

            {/* SVG Thumbnail Preview */}
            <div className="h-32 w-full rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center p-2 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-md">
                <polygon
                  points="50,15 70,38 83,61 50,88 17,61 30,38"
                  fill={isCrystalDone ? '#F4C96B' : '#342A4F'}
                  stroke={isCrystalDone ? '#FFF8F1' : '#B9A5E8'}
                  strokeWidth="2"
                />
                <line x1="50" y1="15" x2="50" y2="88" stroke="#FFF8F1" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="30" y1="38" x2="70" y2="38" stroke="#FFF8F1" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>

            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">
              Dream Repair Lab
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Mend a shattered crystal with threads of moonlight across four geometric facets: Hope, Memory, Wonder, and Courage.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => handleTabSelect('lab')}
              className={`w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeProjectTab === 'lab'
                  ? 'bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow'
                  : 'bg-[var(--surface-badge)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
              }`}
            >
              <span>{activeProjectTab === 'lab' ? 'Active on Workbench' : 'Open Repair Lab'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: Moonlight Lantern Studio (Anchor for #dream-lab) */}
        <div
          id="dream-lab"
          className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between backdrop-blur-sm ${
            activeProjectTab === 'studio'
              ? 'border-[#F4C96B] bg-[var(--bg-card)] shadow-xl scale-102'
              : 'border-[var(--border-color)] bg-[var(--bg-card)]/70 hover:border-[var(--border-glow)]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-badge)] text-[var(--accent-rose)]">
                Invention 02 · Dream Lab
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isCardDone
                    ? 'border-[#D995B7]/50 bg-[#D995B7]/20 text-[var(--accent-rose)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                {isCardDone ? (
                  <>
                    <Check className="w-3 h-3 text-[#D995B7]" />
                    <span>✦ Forged</span>
                  </>
                ) : (
                  <span>Ready to Start</span>
                )}
              </span>
            </div>

            {/* SVG Thumbnail Preview */}
            <div className="h-32 w-full rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center p-2 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-md">
                <circle cx="50" cy="50" r="28" fill="#F4C96B" opacity="0.35" className="animate-pulse-glow" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#D4AF37" strokeWidth="2" />
                <polygon points="50,42 53,48 59,49 55,54 56,60 50,57 44,60 45,54 41,49 47,48" fill="#FFF8F1" />
                <rect x="44" y="26" width="12" height="4" rx="1" fill="#D4AF37" />
                <rect x="42" y="70" width="16" height="4" rx="1" fill="#D4AF37" />
              </svg>
            </div>

            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">
              Moonlight Lantern Studio
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Design a custom celestial vessel, choose moonlight hues and celestial symbols, name your dream, and generate an exportable keepsake card.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => handleTabSelect('studio')}
              className={`w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeProjectTab === 'studio'
                  ? 'bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow'
                  : 'bg-[var(--surface-badge)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
              }`}
            >
              <span>{activeProjectTab === 'studio' ? 'Active on Workbench' : 'Open Lantern Studio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: Dream Delivery Navigator */}
        <div
          className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between backdrop-blur-sm ${
            activeProjectTab === 'navigator'
              ? 'border-[#F4C96B] bg-[var(--bg-card)] shadow-xl scale-102'
              : 'border-[var(--border-color)] bg-[var(--bg-card)]/70 hover:border-[var(--border-glow)]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-badge)] text-[var(--accent-lavender)]">
                Invention 03
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isDeliveryDone
                    ? 'border-[#B9A5E8]/50 bg-[#B9A5E8]/20 text-[var(--accent-lavender)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                {isDeliveryDone ? (
                  <>
                    <Check className="w-3 h-3 text-[#B9A5E8]" />
                    <span>✦ All 3 Delivered</span>
                  </>
                ) : (
                  <span>Deliveries: {state.deliveriesCompleted.length}/3</span>
                )}
              </span>
            </div>

            {/* SVG Thumbnail Preview */}
            <div className="h-32 w-full rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center p-2 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-md">
                <circle cx="20" cy="70" r="6" fill="#D4AF37" />
                <circle cx="45" cy="30" r="5" fill="#B9A5E8" />
                <circle cx="80" cy="50" r="5" fill="#F4C96B" />
                <path d="M 20 70 Q 30 35 45 30 T 80 50" stroke="#F4C96B" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              </svg>
            </div>

            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">
              Dream Delivery Navigator
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Chart nocturnal flight routes across cloud spires, mist lighthouses, and moonflower terraces to safely deliver restored dreams.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => handleTabSelect('navigator')}
              className={`w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeProjectTab === 'navigator'
                  ? 'bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow'
                  : 'bg-[var(--surface-badge)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
              }`}
            >
              <span>{activeProjectTab === 'navigator' ? 'Active on Workbench' : 'Open Delivery Map'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ACTIVE WORKBENCH INTERACTIVE STAGE */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-2xl backdrop-blur-xl relative">
        {/* Stage Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 pb-8 border-b border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => handleTabSelect('lab')}
            aria-pressed={activeProjectTab === 'lab'}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeProjectTab === 'lab'
                ? 'bg-[var(--accent-gold)] text-[#453026] shadow-md scale-105'
                : 'bg-[var(--surface-badge)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>1. Dream Repair Lab</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('studio')}
            aria-pressed={activeProjectTab === 'studio'}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeProjectTab === 'studio'
                ? 'bg-[var(--accent-gold)] text-[#453026] shadow-md scale-105'
                : 'bg-[var(--surface-badge)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Moonlight Lantern Studio</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('navigator')}
            aria-pressed={activeProjectTab === 'navigator'}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeProjectTab === 'navigator'
                ? 'bg-[var(--accent-gold)] text-[#453026] shadow-md scale-105'
                : 'bg-[var(--surface-badge)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3. Delivery Navigator</span>
          </button>
        </div>

        {/* ACTIVE PROJECT RENDER */}
        <div className="pt-8">
          {activeProjectTab === 'lab' && (
            <DreamRepairLab onNavigateToStudio={() => handleTabSelect('studio')} />
          )}

          {activeProjectTab === 'studio' && (
            <LanternStudio onNavigateToDelivery={() => handleTabSelect('navigator')} />
          )}

          {activeProjectTab === 'navigator' && (
            <DreamDeliveryNavigator
              onNavigateToEnding={() => goToSection('goodnight')}
            />
          )}
        </div>
      </div>
    </section>
  );
};
