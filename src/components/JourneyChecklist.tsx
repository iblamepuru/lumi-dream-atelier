import React, { useEffect, useRef } from 'react';
import { Check, Compass, ArrowRight } from 'lucide-react';
import { Link } from './Link';
import { useAtelier } from '../context/AtelierContext';
import { playChime, playSparkle } from '../utils/soundEngine';

// A short guided path through the best of the site (about two minutes), with live tick marks
// driven by the same saved progress the rest of the atelier uses.
export const JourneyChecklist: React.FC = () => {
  const { state, lumiSay } = useAtelier();

  const steps = [
    { done: state.storyProgress.starAwakened, label: 'Wake the fallen star', hint: 'Chapter 1 of the story', to: '/story' },
    { done: state.crystalRepaired, label: 'Repair the dream crystal', hint: 'Place all four shards', to: '/workshop/repair-lab' },
    { done: state.lanternConfig.cardCreated, label: 'Make a lantern for it', hint: 'Create your keepsake card', to: '/workshop/lantern-studio' },
    { done: state.deliveriesCompleted.length > 0, label: 'Deliver the dream home', hint: 'Pick a sleeper on the map', to: '/workshop/delivery-map' },
    { done: state.discoveredStars.length > 0, label: 'Find a hidden star', hint: 'Look closely at the moon above', to: '/' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  // Cheer once when the journey is completed.
  const cheered = useRef(allDone);
  useEffect(() => {
    if (allDone && !cheered.current) {
      cheered.current = true;
      playSparkle(state.isMuted);
      lumiSay?.('You did it! The dream is mended, lit and delivered. Thank you, apprentice!', 'celebrating');
    }
  }, [allDone, state.isMuted, lumiSay]);

  return (
    <section id="journey" aria-labelledby="journey-heading" className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-6">
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 id="journey-heading" className="flex items-center gap-2 text-lg sm:text-xl font-serif font-bold text-[var(--text-primary)]">
            <Compass className="w-5 h-5 text-[var(--accent-gold)]" aria-hidden="true" />
            {allDone ? 'Journey complete ✦' : "Start Lumi's journey"}
          </h2>
          <span className="text-xs font-bold text-[var(--accent-gold)]">
            {doneCount}/{steps.length} · about 2 minutes
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-[var(--surface-badge)] overflow-hidden mb-4" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B9A5E8] via-[#D995B7] to-[#F4C96B] transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>

        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={step.label}>
              <Link
                to={step.to}
                onClick={() => playChime(state.isMuted, 587.33 + i * 70)}
                className={`group flex items-center gap-3 p-2.5 rounded-2xl border transition-colors min-h-[48px] ${
                  step.done
                    ? 'border-[#F4C96B]/40 bg-[#F4C96B]/10'
                    : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-glow)]'
                }`}
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done ? 'bg-[#F4C96B] text-[#453026]' : 'bg-[var(--surface-badge)] text-[var(--text-secondary)]'
                  }`}
                >
                  {step.done ? <Check className="w-4 h-4" aria-label="Done" /> : i + 1}
                </span>
                <span className="flex-grow min-w-0">
                  <span className={`block text-sm font-semibold ${step.done ? 'text-[var(--text-secondary)] line-through decoration-[#F4C96B]/60' : 'text-[var(--text-primary)]'}`}>
                    {step.label}
                  </span>
                  <span className="block text-[11px] text-[var(--text-muted)]">{step.hint}</span>
                </span>
                {!step.done && (
                  <ArrowRight className="w-4 h-4 text-[var(--accent-gold)] shrink-0 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                )}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
