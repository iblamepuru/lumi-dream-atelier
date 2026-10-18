import React from 'react';
import { BookOpen, Sparkles, Wrench, ArrowRight } from 'lucide-react';
import { Link } from './Link';
import { useAtelier } from '../context/AtelierContext';
import { playChime } from '../utils/soundEngine';

// The three things the haX.baby brief asks every portfolio to answer, said plainly
// right after the hero, each linking to the page that tells it in full.
const ANSWERS = [
  {
    n: 1,
    title: 'What Lumi is',
    icon: Sparkles,
    text: 'A tiny moon moth with lavender wings, amber eyes and a knitted rose scarf. Quietly brave, very curious, and a little forgetful.',
    link: { to: '/meet-lumi', label: 'Meet Lumi' },
  },
  {
    n: 2,
    title: 'What Lumi does',
    icon: Wrench,
    text: 'Junior Dream Repairer at Workshop No. 07: mends broken dream crystals, builds lanterns to carry them, and flies them home before sunrise.',
    link: { to: '/workshop', label: 'Visit the Workshop' },
  },
  {
    n: 3,
    title: "Lumi's story",
    icon: BookOpen,
    text: 'It began the night Lumi woke a fallen star. Lumi lives in an old brass observatory above the clouds, and dreams of a lantern glowing in every sleeping window.',
    link: { to: '/story', label: 'Read the story' },
  },
];

export const ThreeAnswers: React.FC = () => {
  const { state } = useAtelier();

  return (
    <section id="three-answers" aria-labelledby="three-answers-heading" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <h2 id="three-answers-heading" className="text-center text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] mb-8">
        Lumi in Three Answers
      </h2>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ANSWERS.map(({ n, title, icon: Icon, text, link }) => (
          <li
            key={n}
            className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-glow)] shadow-lg transition-colors flex flex-col gap-3"
          >
            <span className="w-11 h-11 rounded-2xl bg-[var(--surface-badge)] border border-[var(--border-color)] flex items-center justify-center" aria-hidden="true">
              <Icon className="w-5 h-5 text-[var(--accent-gold)]" />
            </span>
            <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
              {n}. {title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-grow">{text}</p>
            <Link
              to={link.to}
              onClick={() => playChime(state.isMuted, 659.25 + n * 60)}
              className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-gold)] hover:underline underline-offset-4 min-h-[32px]"
            >
              <span>{link.label}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
};
