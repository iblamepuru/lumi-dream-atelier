import React, { useEffect, useRef, useState } from 'react';
import { goToSection } from '../router';
import { STORY_SCENES, INVENTIONS } from '../data/story';
import { HiddenStar } from './HiddenStar';
import { useAtelier } from '../context/AtelierContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { playChime, playSnap, playSparkle, playWhoosh } from '../utils/soundEngine';
import { Sparkles, Check, ChevronRight, Hammer, Feather, Compass, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StorySection: React.FC = () => {
  const { state, updateStoryProgress } = useAtelier();
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  // Scroll-driven chapters: each scene reveals as it scrolls in, and the
  // flight path + moth marker track how far through the story the reader is.
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const mothRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => [
    false,
    false,
    false,
    false,
  ].map(() => typeof IntersectionObserver === 'undefined'));

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const scenes = sceneRefs.current.filter((el): el is HTMLDivElement => el !== null);

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.chapter);
          setRevealed((prev) => (prev[index] ? prev : prev.map((v, i) => (i === index ? true : v))));
        });
      },
      { threshold: 0.12 }
    );
    // A thin band across the middle of the viewport decides the "current" chapter.
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveChapter(Number((entry.target as HTMLElement).dataset.chapter));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    scenes.forEach((el) => {
      revealObserver.observe(el);
      chapterObserver.observe(el);
    });
    return () => {
      revealObserver.disconnect();
      chapterObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight / 2 - rect.top) / rect.height));
      pathRef.current?.style.setProperty('stroke-dashoffset', String(1 - progress));
      mothRef.current?.style.setProperty('top', `${progress * 100}%`);
      progressBarRef.current?.style.setProperty('transform', `scaleX(${progress})`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const sceneMotion = (index: number) =>
    reducedMotion || revealed[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12';

  const jumpToChapter = (index: number) => {
    playChime(state.isMuted, 587.33 + index * 98);
    sceneRefs.current[index]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const { starAwakened, fragmentsCollected, inventionsInspected } = state.storyProgress;

  // Scene 1: Awaken the Star
  const handleAwakenStar = () => {
    if (!starAwakened) {
      updateStoryProgress({ starAwakened: true });
      playSparkle(state.isMuted);
      try {
        confetti({
          particleCount: 20,
          spread: 40,
          colors: ['#F4C96B', '#FFF8F1'],
        });
      } catch {
        // Fallback
      }
    } else {
      playChime(state.isMuted, 987.77);
    }
  };

  // Scene 2: Collect Shards (1, 2, 3)
  const handleCollectShard = (shardId: number) => {
    if (!fragmentsCollected.includes(shardId)) {
      const nextFragments = [...fragmentsCollected, shardId];
      updateStoryProgress({ fragmentsCollected: nextFragments });
      playSnap(state.isMuted);

      if (nextFragments.length === 3) {
        setTimeout(() => playSparkle(state.isMuted), 200);
      }
    }
  };

  // Scene 3: Inspect Invention
  const handleInspectInvention = (invId: string) => {
    setActiveDrawer(activeDrawer === invId ? null : invId);
    playChime(state.isMuted, 659.25);
    if (!inventionsInspected.includes(invId)) {
      updateStoryProgress({
        inventionsInspected: [...inventionsInspected, invId],
      });
    }
  };

  // Scene 4: Step Up to Workbench
  const handleEnterWorkbench = () => {
    playWhoosh(state.isMuted);
    goToSection('projects');
  };

  const getInventionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Feather':
        return <Feather className="w-5 h-5 text-[#B9A5E8]" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-[#F4C96B]" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-[#93C5FD]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F4C96B]" />;
    }
  };

  return (
    <section
      id="story"
      ref={sectionRef}
      aria-labelledby="story-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Bedtime Chronicle</span>
        </div>
        <h2 id="story-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)]">
          Lumi's Origin Story
        </h2>
        <p className="text-base sm:text-lg text-[var(--text-secondary)]">
          Four handcrafted storybook chapters. Help Lumi along the way.
        </p>
      </div>

      {/* Sticky scroll chapter tracker */}
      <div className="sticky top-[4.5rem] z-30 flex justify-center mb-10 pointer-events-none">
        <nav
          aria-label="Story chapters"
          className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-[var(--bg-glass)] border border-[var(--border-glow)] shadow-lg backdrop-blur-md max-w-full"
        >
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--accent-gold)] whitespace-nowrap">
            Ch. {activeChapter + 1}/4
          </span>
          <span className="hidden sm:inline text-xs font-serif font-semibold text-[var(--text-primary)] truncate max-w-[14rem]">
            {STORY_SCENES[activeChapter]?.title}
          </span>
          <span className="flex items-center gap-1.5">
            {STORY_SCENES.slice(0, 4).map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => jumpToChapter(i)}
                aria-label={`Go to chapter ${i + 1}: ${scene.title}`}
                aria-current={activeChapter === i ? 'step' : undefined}
                className="p-2 rounded-full"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    activeChapter === i
                      ? 'w-5 h-2 bg-[var(--accent-gold)] shadow-[0_0_8px_rgba(244,201,107,0.7)]'
                      : i < activeChapter
                        ? 'w-2 h-2 bg-[var(--moth-lavender)]'
                        : 'w-2 h-2 bg-[var(--border-color)]'
                  }`}
                />
              </button>
            ))}
          </span>
          <span className="relative w-10 sm:w-16 h-1 rounded-full bg-[var(--border-color)] overflow-hidden" aria-hidden="true">
            <span
              ref={progressBarRef}
              className="absolute inset-0 origin-left bg-gradient-to-r from-[#B9A5E8] to-[#F4C96B]"
              style={{ transform: 'scaleX(0)' }}
            />
          </span>
        </nav>
      </div>

      {/* Decorative SVG Flight Path connecting scenes */}
      <div className="hidden lg:block absolute left-1/2 top-48 bottom-24 -translate-x-1/2 w-8 pointer-events-none z-0" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 20 800" preserveAspectRatio="none">
          <path
            d="M 10 0 Q 2 200 10 400 T 10 800"
            stroke="var(--moth-lavender)"
            strokeWidth="2"
            strokeDasharray="4 6"
            fill="none"
            opacity="0.45"
          />
          {/* Golden thread that fills in as the reader scrolls */}
          <path
            ref={pathRef}
            d="M 10 0 Q 2 200 10 400 T 10 800"
            pathLength={1}
            stroke="var(--accent-gold)"
            strokeWidth="2.5"
            strokeDasharray="1"
            strokeDashoffset="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Little moth-light riding the thread */}
        <div
          ref={mothRef}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F4C96B] shadow-[0_0_14px_6px_rgba(244,201,107,0.55)]"
          style={{ top: '0%' }}
        />
      </div>

      {/* 4 SCENES GRID */}
      <div className="space-y-16 relative z-10">
        
        {/* SCENE 1: The Star That Fell Asleep */}
        <div
          ref={(el) => {
            sceneRefs.current[0] = el;
          }}
          data-chapter={0}
          className={`p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg backdrop-blur-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-all duration-700 ease-out ${sceneMotion(0)} ${activeChapter === 0 ? 'ring-2 ring-[var(--accent-gold)]/40' : ''}`}
        >
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
              <span>Chapter 01</span>
              <span>·</span>
              <span>{STORY_SCENES[0].subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)]">
              {STORY_SCENES[0].title}
            </h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              {STORY_SCENES[0].text}
            </p>
            <div className="p-3 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-gold)] flex-shrink-0" />
              <span>{STORY_SCENES[0].instruction}</span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] relative">
            <button
              type="button"
              onClick={handleAwakenStar}
              aria-label={starAwakened ? 'Awakened star, humming with warm light' : 'Sleeping gray star, tap to awaken'}
              className="group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)]"
            >
              {/* Star Glow */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-700 ${
                  starAwakened
                    ? 'bg-[#F4C96B]/30 blur-xl scale-125 animate-pulse-glow'
                    : 'bg-transparent'
                }`}
              />

              {/* Star Illustration */}
              <svg
                viewBox="0 0 100 100"
                className={`w-28 h-28 transition-all duration-500 ${
                  starAwakened
                    ? 'text-[#F4C96B] drop-shadow-[0_0_20px_#F4C96B] scale-110'
                    : 'text-[#6B5A75] opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                fill={starAwakened ? '#F4C96B' : 'currentColor'}
                stroke={starAwakened ? '#FFF8F1' : '#44365C'}
                strokeWidth="2"
              >
                <polygon points="50,5 63,35 95,38 70,60 78,92 50,75 22,92 30,60 5,38 37,35" />
                {starAwakened && (
                  <circle cx="50" cy="50" r="10" fill="#FFF8F1" />
                )}
              </svg>

              <span className="mt-3 text-xs font-bold font-serif text-[var(--text-primary)] flex items-center gap-1.5">
                {starAwakened ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#F4C96B]" />
                    <span>Star Awakened & Glowing!</span>
                  </>
                ) : (
                  <span>✦ Tap to awaken the star</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* SCENE 2: The First Broken Dream */}
        <div
          ref={(el) => {
            sceneRefs.current[1] = el;
          }}
          data-chapter={1}
          className={`p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg backdrop-blur-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-all duration-700 ease-out ${sceneMotion(1)} ${activeChapter === 1 ? 'ring-2 ring-[var(--accent-gold)]/40' : ''}`}
        >
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-rose)]">
              <span>Chapter 02</span>
              <span>·</span>
              <span>{STORY_SCENES[1].subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)]">
              {STORY_SCENES[1].title}
            </h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              {STORY_SCENES[1].text}
            </p>
            <div className="p-3 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-rose)] flex-shrink-0" />
                <span>{STORY_SCENES[1].instruction}</span>
              </span>
              <span className="font-bold text-[var(--accent-rose)]">
                {fragmentsCollected.length}/3 Shards
              </span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] min-h-[220px] relative">
            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                { id: 1, label: 'Shard of Dawn', color: '#F4C96B', points: '30,10 48,35 12,40' },
                { id: 2, label: 'Shard of Starlight', color: '#D995B7', points: '25,10 45,45 10,30' },
                { id: 3, label: 'Shard of Moonbeam', color: '#B9A5E8', points: '20,15 45,25 25,50' },
              ].map((shard) => {
                const collected = fragmentsCollected.includes(shard.id);
                return (
                  <button
                    key={shard.id}
                    type="button"
                    onClick={() => handleCollectShard(shard.id)}
                    aria-label={`Crystal ${shard.label} ${collected ? '(In Satchel)' : '(Click to gather)'}`}
                    disabled={collected}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      collected
                        ? 'border-[#D995B7]/50 bg-[#D995B7]/15 opacity-75 cursor-default'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:scale-105 active:scale-95 hover:border-[var(--border-glow)] animate-float-gentle'
                    }`}
                  >
                    <svg viewBox="0 0 60 60" className="w-12 h-12">
                      <polygon
                        points={shard.points}
                        fill={shard.color}
                        stroke="#FFF8F1"
                        strokeWidth="1.5"
                        opacity={collected ? 0.45 : 1}
                        className={collected ? '' : 'drop-shadow-[0_0_8px_rgba(244,201,107,0.6)]'}
                      />
                    </svg>
                    <span className="mt-2 text-[11px] font-bold text-[var(--text-primary)] text-center leading-tight">
                      {collected ? 'Collected ✓' : shard.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SCENE 3: The Moonlit Atelier */}
        <div
          ref={(el) => {
            sceneRefs.current[2] = el;
          }}
          data-chapter={2}
          className={`p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg backdrop-blur-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative transition-all duration-700 ease-out ${sceneMotion(2)} ${activeChapter === 2 ? 'ring-2 ring-[var(--accent-gold)]/40' : ''}`}
        >
          
          {/* HIDDEN STAR #3 (star-story): Tucked inside the observatory scene */}
          <div className="absolute top-6 right-6 z-20">
            <HiddenStar
              starId="star-story"
              label="The Observatory Cupola Star"
              hint="Resting high above the brass telescope in Workshop No. 07..."
            />
          </div>

          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-lavender)]">
              <span>Chapter 03</span>
              <span>·</span>
              <span>{STORY_SCENES[2].subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)]">
              {STORY_SCENES[2].title}
            </h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              {STORY_SCENES[2].text}
            </p>
            <div className="p-3 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-lavender)] flex-shrink-0" />
                <span>{STORY_SCENES[2].instruction}</span>
              </span>
              <span className="font-bold text-[var(--accent-lavender)]">
                {inventionsInspected.length}/3 Inspected
              </span>
            </div>
          </div>

          <div className="md:col-span-6 space-y-3">
            {INVENTIONS.map((inv) => {
              const isOpen = activeDrawer === inv.id;
              const isInspected = inventionsInspected.includes(inv.id);
              return (
                <div
                  key={inv.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'border-[#F4C96B] bg-[var(--bg-primary)] shadow-md'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-glow)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleInspectInvention(inv.id)}
                    aria-expanded={isOpen}
                    className="w-full p-3.5 flex items-center justify-between text-left min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-[var(--surface-badge)]">
                        {getInventionIcon(inv.icon)}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] block">
                          {inv.tag} {isInspected && '· Inspected ✓'}
                        </span>
                        <span className="text-sm font-bold font-serif text-[var(--text-primary)]">
                          {inv.name}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/50">
                      {inv.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SCENE 4: Where Lumi Is Going */}
        <div
          ref={(el) => {
            sceneRefs.current[3] = el;
          }}
          data-chapter={3}
          className={`p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-primary)] to-[var(--surface-badge)] border-2 border-[var(--border-glow)] shadow-2xl backdrop-blur-md text-center max-w-3xl mx-auto space-y-6 transition-all duration-700 ease-out ${sceneMotion(3)} ${activeChapter === 3 ? 'ring-2 ring-[var(--accent-gold)]/40' : ''}`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] bg-[var(--bg-card)] border border-[var(--border-color)]">
            <Star className="w-3.5 h-3.5 text-[#F4C96B]" />
            <span>Chapter 04 · {STORY_SCENES[3].subtitle}</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
            {STORY_SCENES[3].title}
          </h3>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {STORY_SCENES[3].text}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleEnterWorkbench}
              className="px-8 py-4 rounded-full font-bold text-base bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-xl hover:shadow-[0_0_30px_rgba(244,201,107,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer min-h-[48px] inline-flex items-center gap-2"
            >
              <span>Step Up to the Workbench</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
