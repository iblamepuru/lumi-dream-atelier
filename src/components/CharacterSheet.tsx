import React, { Suspense, lazy, useState } from 'react';
import { LUMI_CHARACTER, type SignatureObject } from '../data/character';
import { LumiCharacter } from './LumiCharacter';
import { HiddenStar } from './HiddenStar';

// Three.js is only downloaded when a visitor switches to the 3D view.
const Lumi3DViewer = lazy(() => import('./Lumi3DViewer').then((m) => ({ default: m.Lumi3DViewer })));
import type { LumiMood } from '../types/atelier';
import { useAtelier } from '../context/AtelierContext';
import { playChime, playSnap } from '../utils/soundEngine';
import { Flame, Sparkles, Package, Compass, Heart, ShieldAlert, BookOpen, Layers, Box } from 'lucide-react';

export const CharacterSheet: React.FC = () => {
  const { state } = useAtelier();
  const [moodPick, setMoodPick] = useState<{ theme: typeof state.theme; mood: LumiMood } | null>(null);
  const themeMood: LumiMood = state.theme === 'midnight' ? 'curious' : 'happy';
  const selectedMood = moodPick?.theme === state.theme ? moodPick.mood : themeMood;
  const [displayMode, setDisplayMode] = useState<'2d' | '3d'>('2d');
  const [activeObject, setActiveObject] = useState<SignatureObject>(LUMI_CHARACTER.signatureObjects[0]);

  const moods: { id: LumiMood; label: string; icon: string }[] = [
    { id: 'happy', label: 'Happy', icon: '✦' },
    { id: 'curious', label: 'Curious', icon: '?' },
    { id: 'focused', label: 'Focused', icon: '⚙' },
    { id: 'sleepy', label: 'Sleepy', icon: '☾' },
    { id: 'celebrating', label: 'Joy', icon: '★' },
  ];

  const handleMoodSelect = (mood: LumiMood) => {
    setMoodPick({ theme: state.theme, mood });
    playChime(state.isMuted, 783.99);
  };

  const handleObjectSelect = (obj: SignatureObject) => {
    setActiveObject(obj);
    playSnap(state.isMuted);
  };

  const getObjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-[#F4C96B]" />;
      case 'Package':
        return <Package className="w-4 h-4 text-[#D995B7]" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-[#B9A5E8]" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-[#93C5FD]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#F4C96B]" />;
    }
  };

  return (
    <section
      id="profile"
      aria-labelledby="profile-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>A Moon Moth Profile</span>
        </div>
        <h2 id="profile-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)]">
          Meet Lumi the Moon Moth
        </h2>
        <p className="text-base sm:text-lg text-[var(--text-secondary)]">
          A tiny moth with a big lantern and an even bigger heart.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Portrait, Mood Switcher, Signature Objects */}
        <div className="lg:col-span-5 flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl relative backdrop-blur-sm">
          
          {/* Hidden Star #2: Near Lumi's satchel (lower right of character) */}
          <div className="absolute top-6 right-6 z-20">
            <HiddenStar
              starId="star-profile"
              label="The Satchel Shard Star"
              hint="Peeking right by Lumi's dream fragment satchel..."
            />
          </div>

          {/* 2D vs 3D Viewport Toggle */}
          <div className="inline-flex items-center p-1 bg-[var(--surface-badge)] border border-[var(--border-color)] rounded-full mb-3 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setDisplayMode('2d');
                playChime(state.isMuted, 523.25);
              }}
              aria-pressed={displayMode === '2d'}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                displayMode === '2d'
                  ? 'bg-[var(--accent-gold)] text-[#453026] shadow-sm font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Storybook</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDisplayMode('3d');
                playChime(state.isMuted, 659.25);
              }}
              aria-pressed={displayMode === '3d'}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                displayMode === '3d'
                  ? 'bg-gradient-to-r from-[#D995B7] to-[#B9A5E8] text-[#12162E] shadow-sm font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Lumi</span>
            </button>
          </div>

          {/* Interactive Character Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            {displayMode === '2d' ? (
              <LumiCharacter
                mood={selectedMood}
                size="100%"
                lanternColor={state.lanternConfig.color}
                enableEyeTracking={true}
                hasGoldenCrown={state.discoveredStars.length === 5}
              />
            ) : (
              <Suspense
                fallback={
                  <div role="status" className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
                    Spinning up the 3D moth…
                  </div>
                }
              >
                <Lumi3DViewer className="w-full h-full" />
              </Suspense>
            )}
          </div>

          {/* Mood Switcher Buttons */}
          <div className="w-full mt-4 pt-4 border-t border-[var(--border-color)]">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-center mb-2">
              Lumi's Mood Expression:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMoodSelect(m.id)}
                  aria-pressed={selectedMood === m.id}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[38px] ${
                    selectedMood === m.id
                      ? 'bg-[var(--accent-gold)] text-[#453026] shadow-md scale-105'
                      : 'bg-[var(--surface-badge)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Signature Objects Shelf */}
          <div className="w-full mt-6 pt-4 border-t border-[var(--border-color)] space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-center">
              Signature Atelier Objects (Click to Inspect):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {LUMI_CHARACTER.signatureObjects.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => handleObjectSelect(obj)}
                  aria-pressed={activeObject.id === obj.id}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 min-h-[44px] ${
                    activeObject.id === obj.id
                      ? 'border-[#F4C96B] bg-[#F4C96B]/15 shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-glow)]'
                  }`}
                >
                  <span className="p-1 rounded-lg bg-[var(--bg-card)]">
                    {getObjectIcon(obj.iconName)}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                    {obj.shortLabel}
                  </span>
                </button>
              ))}
            </div>

            {/* Object Detail Card */}
            {activeObject && (
              <div className="p-3.5 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-1">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  {getObjectIcon(activeObject.iconName)}
                  {activeObject.name}
                </span>
                <p className="leading-relaxed">{activeObject.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 5-Point Character Sheet & Dossier */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* THE MANDATORY 5-POINT CHARACTER SHEET CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl relative backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <span className="font-serif text-sm font-bold tracking-wider uppercase text-[var(--accent-gold)]">
                Lumi's 5-Point Character Sheet
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F4C96B]/20 text-[var(--accent-gold)]">
                ✦ Original Character
              </span>
            </div>

            {/* Field 1: Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
              <span className="sm:col-span-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                1. Name:
              </span>
              <span className="sm:col-span-8 text-xl font-bold font-serif text-[var(--text-primary)]">
                {LUMI_CHARACTER.name}
              </span>
            </div>

            {/* Field 2: What They Are */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
              <span className="sm:col-span-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                2. What They Are:
              </span>
              <span className="sm:col-span-8 text-sm font-medium text-[var(--text-secondary)]">
                {LUMI_CHARACTER.whatTheyAre}
              </span>
            </div>

            {/* Field 3: What They Do */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
              <span className="sm:col-span-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                3. What They Do:
              </span>
              <span className="sm:col-span-8 text-sm font-medium text-[var(--text-secondary)]">
                {LUMI_CHARACTER.whatTheyDo}
              </span>
            </div>

            {/* Field 4: Their Story */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
              <span className="sm:col-span-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                4. Their Story:
              </span>
              <span className="sm:col-span-8 text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                {LUMI_CHARACTER.theirStory}
              </span>
            </div>

            {/* Field 5: Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline pt-2 border-t border-[var(--border-color)]">
              <span className="sm:col-span-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                5. Tagline:
              </span>
              <span className="sm:col-span-8 text-base font-serif italic font-bold text-[var(--accent-gold)]">
                "{LUMI_CHARACTER.tagline}"
              </span>
            </div>
          </div>

          {/* Personality Badges */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Personality Traits
            </span>
            <div className="flex flex-wrap gap-2">
              {LUMI_CHARACTER.personality.map((trait, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  ✦ {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Home & Quirks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] block">Where Lumi lives</span>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{LUMI_CHARACTER.home}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] block">Little quirks</span>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1">
                {LUMI_CHARACTER.quirks.map((quirk) => (
                  <li key={quirk}>☾ {quirk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Abilities & Weakness Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Special Ability */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                <Heart className="w-4 h-4 text-[#F4C96B]" />
                <span>Special Ability</span>
              </div>
              <h3 className="text-sm font-bold font-serif text-[var(--text-primary)]">
                {LUMI_CHARACTER.specialAbility.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {LUMI_CHARACTER.specialAbility.description}
              </p>
            </div>

            {/* Weakness */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-rose)]">
                <ShieldAlert className="w-4 h-4 text-[#D995B7]" />
                <span>Vulnerability</span>
              </div>
              <h3 className="text-sm font-bold font-serif text-[var(--text-primary)]">
                {LUMI_CHARACTER.weakness.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {LUMI_CHARACTER.weakness.description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
