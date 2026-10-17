import React, { useEffect, useState } from 'react';
import { goToSection } from '../router';
import { LumiCharacter } from './LumiCharacter';
import { HiddenStar } from './HiddenStar';
import { useAtelier } from '../context/AtelierContext';
import { playChime, playWhoosh } from '../utils/soundEngine';
import { Sparkles, ArrowDown } from 'lucide-react';

export const HeroScene: React.FC = () => {
  const { state } = useAtelier();
  const [isDozing, setIsDozing] = useState(false);

  // After a quiet spell Lumi dozes off; any pointer, key or scroll wakes them up with a chime.
  useEffect(() => {
    let dozing = false;
    const doze = () => {
      dozing = true;
      setIsDozing(true);
    };
    let timer = window.setTimeout(doze, 20000);
    const wake = () => {
      window.clearTimeout(timer);
      if (dozing) {
        dozing = false;
        setIsDozing(false);
        playChime(state.isMuted, 880);
      }
      timer = window.setTimeout(doze, 20000);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll'] as const;
    events.forEach((evt) => window.addEventListener(evt, wake, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, wake));
    };
  }, [state.isMuted]);

  // Twilight: bright and happy. Midnight: wide-eyed and curious under the stars.
  const heroMood = isDozing ? 'sleepy' : state.theme === 'midnight' ? 'curious' : 'happy';

  const handleEnterAtelier = () => {
    playWhoosh(state.isMuted);
    goToSection('projects');
  };

  const handleMeetLumi = () => {
    playChime(state.isMuted, 659.25);
    goToSection('profile');
  };

  return (
    <section
      id="hero"
      aria-label="Hero Introduction"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'var(--sky-gradient)',
      }}
    >
      {/* Decorative Night Clouds & Stars Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Layered Cloud SVG 1 */}
        <svg
          viewBox="0 0 1440 320"
          className="absolute -top-12 left-0 w-full opacity-40 animate-cloud-drift text-[var(--bg-secondary)]"
          fill="currentColor"
        >
          <path d="M0,128L48,149.3C96,171,192,213,288,218.7C384,224,480,192,576,165.3C672,139,768,117,864,122.7C960,128,1056,160,1152,154.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>

        {/* Ambient Twinkling Stars */}
        <div className="absolute top-1/4 left-1/6 w-1.5 h-1.5 bg-[#F4C96B] rounded-full animate-star-twinkle" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-[#FFF8F1] rounded-full animate-star-twinkle" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-1/5 right-1/4 w-1.5 h-1.5 bg-[#D995B7] rounded-full animate-star-twinkle" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-2/3 right-1/6 w-2 h-2 bg-[#B9A5E8] rounded-full animate-star-twinkle" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-3/4 left-1/5 w-1 h-1 bg-[#F4C96B] rounded-full animate-star-twinkle" style={{ animationDelay: '2.3s' }} />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          {/* Whimsical Badge Tags */}
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
              <Sparkles className="w-3 h-3 text-[#F4C96B]" />
              Junior Dream Repairer
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              Workshop No. 07
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-rose)]">
              Open until sunrise ✦
            </span>
          </div>

          {/* Mandatory Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-[var(--text-primary)] leading-[1.12]">
            Some dreams <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4C96B] via-[#D995B7] to-[#B9A5E8]">
              need a little light.
            </span>
          </h1>

          {/* Mandatory Supporting Copy */}
          <p className="text-lg sm:text-xl font-normal text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Meet Lumi, a tiny moon moth who repairs forgotten dreams and guides them home before sunrise.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              type="button"
              onClick={handleEnterAtelier}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-base bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-lg hover:shadow-[0_0_25px_rgba(244,201,107,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Enter the Atelier</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleMeetLumi}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-base bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--border-glow)] hover:bg-[var(--surface-badge)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer min-h-[44px]"
            >
              Meet Lumi
            </button>
          </div>
        </div>

        {/* Right Column: Celestial Scene with Crescent Moon, Hidden Star #1, and Lumi */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-72 sm:w-84 md:w-96 aspect-square flex items-center justify-center">
            
            {/* GIANT GLOWING CRESCENT MOON (SVG) */}
            <svg
              viewBox="0 0 200 200"
              className="absolute -top-4 -right-4 w-52 sm:w-64 h-52 sm:h-64 opacity-85 select-none pointer-events-none animate-float-gentle"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="moon-gradient" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFFDF8" />
                  <stop offset="60%" stopColor="#F9E8B5" />
                  <stop offset="100%" stopColor="#E2BD63" />
                </radialGradient>
                <filter id="moon-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>
              {/* Moon Glow Halo */}
              <path
                d="M 140 20 A 70 70 0 1 0 180 140 A 85 85 0 0 1 140 20"
                fill="#F4C96B"
                opacity="0.35"
                filter="url(#moon-soft-blur)"
              />
              {/* Moon Crescent Surface */}
              <path
                d="M 140 20 A 70 70 0 1 0 180 140 A 85 85 0 0 1 140 20"
                fill="url(#moon-gradient)"
                stroke="#F4C96B"
                strokeWidth="1.5"
              />
              {/* Soft Craters on Moon */}
              <circle cx="95" cy="80" r="7" fill="#E2BD63" opacity="0.3" />
              <circle cx="110" cy="115" r="9" fill="#E2BD63" opacity="0.3" />
              <circle cx="130" cy="65" r="5" fill="#E2BD63" opacity="0.3" />
            </svg>

            {/* HIDDEN STAR #1 (star-hero) - Tucked near the top tip of the crescent moon */}
            <div className="absolute top-2 right-12 z-20">
              <HiddenStar
                starId="star-hero"
                label="The Moon-Tip Star"
                hint="Look closely at the tip of the golden crescent moon..."
              />
            </div>

            {/* CENTERPIECE LUMI CHARACTER */}
            <div className="relative z-10 animate-float-moth">
              <LumiCharacter
                mood={heroMood}
                size={270}
                lanternColor={state.lanternConfig.color}
                enableEyeTracking={true}
                hasGoldenCrown={state.discoveredStars.length === 5}
              />
            </div>

            {/* Soft decorative cloud shelf under Lumi */}
            <div
              className="absolute -bottom-6 w-3/4 h-8 bg-gradient-to-t from-[var(--moth-lavender)]/20 to-transparent rounded-full blur-md"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
