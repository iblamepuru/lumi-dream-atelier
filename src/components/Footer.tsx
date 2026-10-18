import React, { useState } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { EarlyWebBadges } from './EarlyWebBadges';
import { Link } from './Link';
import { playChime } from '../utils/soundEngine';
import { RotateCcw, Sparkles, Code2, Palette, Volume2, Wand2, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetAllProgress, state, prefs, setPref } = useAtelier();
  const [resetAnnounced, setResetAnnounced] = useState(false);

  const handleResetAll = () => {
    resetAllProgress();
    playChime(state.isMuted, 440);
    setResetAnnounced(true);
    setTimeout(() => setResetAnnounced(false), 3000);
  };

  const handleToggleReducedMotion = () => {
    const nextVal = !prefs.forceReducedMotion;
    setPref('forceReducedMotion', nextVal);
    if (nextVal) {
      document.documentElement.classList.add('force-reduced-motion');
    } else {
      document.documentElement.classList.remove('force-reduced-motion');
    }
    playChime(state.isMuted, 523.25);
  };

  const handleToggleSparkleTrail = () => {
    const nextVal = !prefs.sparkleTrail;
    setPref('sparkleTrail', nextVal);
    playChime(state.isMuted, 659.25);
  };

  const handleToggleChaosMode = () => {
    const nextVal = !prefs.chaosMode;
    setPref('chaosMode', nextVal);
    playChime(state.isMuted, nextVal ? 880 : 440);
  };

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-glass)] backdrop-blur-md pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-xs text-[var(--text-secondary)]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-[var(--border-color)]">
          <div className="space-y-1">
            <span className="text-base font-serif font-bold text-[var(--text-primary)] block">
              LUMI — The Dream Repair Atelier ✦
            </span>
            <p className="text-xs text-[var(--text-muted)]">
              haX.baby Hackathon · Baby's First Website · Track 2: Original Character
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Reduced Motion Judge Toggle (First for automated test harnesses) */}
            <button
              type="button"
              onClick={handleToggleReducedMotion}
              aria-pressed={prefs.forceReducedMotion}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                prefs.forceReducedMotion
                  ? 'border-[#B9A5E8] bg-[#B9A5E8]/20 text-[var(--text-primary)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {prefs.forceReducedMotion ? 'Reduced Motion: ON' : 'Preview Reduced Motion'}
            </button>

            {/* Sparkle Trail Toggle (+2 pts side quest) */}
            <button
              type="button"
              onClick={handleToggleSparkleTrail}
              aria-pressed={prefs.sparkleTrail}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                prefs.sparkleTrail
                  ? 'border-[#F4C96B] bg-[#F4C96B]/20 text-[var(--text-primary)] shadow-sm'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[#F4C96B]" />
              <span>Trail: {prefs.sparkleTrail ? 'ON' : 'OFF'}</span>
            </button>

            {/* Responsive Chaos Mode (+5 pts side quest) */}
            <button
              type="button"
              onClick={handleToggleChaosMode}
              aria-pressed={prefs.chaosMode}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                prefs.chaosMode
                  ? 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-sm animate-pulse'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>Chaos Mode</span>
            </button>

            {/* Reset All Progress (Judge / Testing Utility) */}
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3.5 py-1.5 rounded-full border border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Progress</span>
            </button>
          </div>
        </div>

        {resetAnnounced && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-center font-semibold text-[var(--accent-gold)]"
          >
            All atelier memory and progress has been reset to defaults.
          </div>
        )}

        {/* HONEST ATTRIBUTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Character & Concept */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C96B]" />
              <span>Character & Lore</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              Original character <strong className="text-[var(--text-primary)]">Lumi the Moon Moth</strong> and the Workshop No. 07 universe created exclusively for the haX.baby Hackathon (Track 2: Original Character).
            </p>
          </div>

          {/* Card 2: Bespoke Artwork */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent-rose)] font-bold uppercase tracking-wider text-[11px]">
              <Palette className="w-3.5 h-3.5 text-[#D995B7]" />
              <span>Artwork & Graphics</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              100% original: hand-built SVG illustrations and night-sky backdrops, a procedural Three.js 3D Lumi, HTML5 Canvas games and keepsake cards, and CSS effects, all made for this project. No stock art or external images.
            </p>
          </div>

          {/* Card 3: Audio & Fonts */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent-lavender)] font-bold uppercase tracking-wider text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-[#B9A5E8]" />
              <span>Audio & Typography</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              Procedural pentatonic chimes generated locally via the native browser <strong className="text-[var(--text-primary)]">Web Audio API</strong>. The music box and "Lumi's Lullaby" are original compositions synthesized live, with no audio files. Typography: Fraunces, Fredoka, and Nunito via Google Fonts (SIL Open Font License).
            </p>
          </div>

          {/* Card 4: Open Source Stack */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[#93C5FD] font-bold uppercase tracking-wider text-[11px]">
              <Code2 className="w-3.5 h-3.5 text-[#93C5FD]" />
              <span>Open-Source Stack</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              Built with React, Vite, TypeScript, Three.js (3D WebGL model), Tailwind CSS, Lucide React, and canvas-confetti. Live guestbook and visitor odometer stored with Netlify Functions + Netlify Blobs. Ask Lumi replies are written by Claude (Anthropic), with rule-based replies as a fallback. Built with help from AI coding assistants (Claude Code); all code reviewed and tested by the author.
            </p>
          </div>

        </div>

        {/* 90s-style 88x31 badge wall */}
        <EarlyWebBadges />

        {/* Bottom Tagline & Copyright */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
          <p className="italic font-serif">
            "Even the smallest light can rescue a dream."
          </p>
          <p>
            Crafted with care for haX.baby · Baby's First Website · 2026 ·{' '}
            <Link to="/build-notes" className="underline underline-offset-2 hover:text-[var(--accent-gold)]">
              Build notes for judges
            </Link>
          </p>
        </div>

      </div>
    </footer>
  );
};
