import React from 'react';
import { NotebookPen } from 'lucide-react';
import { Link } from './Link';
import { LUMI_CHARACTER } from '../data/character';

// Out-of-world notes for judges: the brief checklist with links, how it's built, and credits.
// Reached from a small footer link so the main experience stays in Lumi's storybook voice.
const CHECKLIST: { group: string; items: { text: string; to?: string }[] }[] = [
  {
    group: 'Core elements',
    items: [
      { text: 'What they are: intro + 5-point character sheet', to: '/meet-lumi' },
      { text: 'What they do: three connected inventions', to: '/workshop' },
      { text: 'Their story: four scroll-driven chapters', to: '/story' },
      { text: 'Reacts to you: eye tracking, clicks, sound with a mute switch', to: '/' },
      { text: 'Mobile-friendly layout (phones and tablets)' },
      { text: 'Hidden Easter eggs: five stars, a dozing Lumi you can wake', to: '/goodnight' },
    ],
  },
  {
    group: 'Tier 1',
    items: [
      { text: 'Eyes follow the pointer, with a touch fallback', to: '/meet-lumi' },
      { text: 'Scroll-driven story', to: '/story' },
      { text: 'Twilight/Midnight toggle changes palette and expression (moon button)' },
      { text: 'Responsive down to 320px' },
    ],
  },
  {
    group: 'Tier 2',
    items: [
      { text: 'Lullaby Lab: Web Audio music box with an original lullaby', to: '/playroom' },
      { text: 'Nightlight cursor: Lantern Hide-and-Seek (CSS mask over a dark dream layer)', to: '/playroom' },
      { text: 'Dream Delivery map animation synced with scroll', to: '/workshop/delivery-map' },
      { text: 'Interactive storybook with page-turn flips (touch + keyboard)', to: '/story' },
      { text: 'Mini-game: Catch the Falling Dreams', to: '/playroom' },
    ],
  },
  {
    group: 'Tier 3',
    items: [
      { text: '3D Lumi in Three.js (press "3D Lumi")', to: '/meet-lumi' },
      { text: 'Live guestbook on a real backend', to: '/guestbook' },
      { text: 'Remembers returning visitors (welcome-back banner)' },
      { text: 'Lumi chats back in character (Ask Lumi, bottom right)' },
      { text: 'Lighthouse mobile, 3 runs on 18 Oct 2026: Performance 86–94, Accessibility 100, Best Practices 100, SEO 91–100' },
    ],
  },
  {
    group: 'Side quests',
    items: [
      { text: 'Live guestbook', to: '/guestbook' },
      { text: 'Sparkle cursor trail (footer toggle)' },
      { text: 'Hit-counter odometer', to: '/guestbook' },
      { text: 'Click sounds + always-visible mute switch' },
      { text: 'Responsive Chaos Mode (⚡ in the header)' },
    ],
  },
];

const card = 'p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3';
const heading = 'text-lg font-serif font-bold text-[var(--text-primary)]';

export const BuildNotes: React.FC = () => (
  <section id="build-notes" aria-labelledby="build-notes-heading" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
    <div className="text-center space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
        <NotebookPen className="w-3.5 h-3.5" />
        <span>Behind the scenes</span>
      </div>
      <h1 id="build-notes-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
        Build Notes
      </h1>
      <p className="text-sm text-[var(--text-secondary)]">
        A quick map for judges and the curious. For the full experience, start at{' '}
        <Link to="/" className="text-[var(--accent-gold)] underline underline-offset-2">
          the beginning
        </Link>
        .
      </p>
    </div>

    <div className={card}>
      <h2 className={heading}>Character sheet</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
        {[
          ['Name', LUMI_CHARACTER.name],
          ['What they are', LUMI_CHARACTER.whatTheyAre],
          ['What they do', LUMI_CHARACTER.whatTheyDo],
          ['Their story', LUMI_CHARACTER.theirStory],
          ['Tagline', `“${LUMI_CHARACTER.tagline}”`],
        ].map(([term, value]) => (
          <React.Fragment key={term}>
            <dt className="font-bold text-[var(--accent-gold)]">{term}</dt>
            <dd className="text-[var(--text-secondary)]">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>

    <div className={card}>
      <h2 className={heading}>Where to find everything</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CHECKLIST.map(({ group, items }) => (
          <div key={group}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] mb-1.5">{group}</h3>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              {items.map(({ text, to }) => (
                <li key={text} className="flex gap-2">
                  <span aria-hidden="true">✓</span>
                  {to ? (
                    <Link to={to} className="hover:text-[var(--text-primary)] underline underline-offset-2 decoration-[var(--border-color)]">
                      {text}
                    </Link>
                  ) : (
                    <span>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className={card}>
      <h2 className={heading}>How it's built</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
        <li>React 19, TypeScript, Vite and Tailwind CSS; a tiny History-API router (no dependency) for real page URLs.</li>
        <li>All art is hand-built SVG, CSS, Canvas and a procedural Three.js model; every sound is synthesized with the Web Audio API.</li>
        <li>Guestbook and visitor odometer: Netlify Functions + Netlify Blobs, with durable rate limits, a honeypot and gentle moderation.</li>
        <li>Ask Lumi: Claude via the Anthropic SDK, rate limited with a daily cap, falling back to storybook replies whenever AI is unavailable.</li>
        <li>Performance: an instant boot screen with inlined CSS, sections that load as you scroll, Three.js only when 3D is opened.</li>
        <li>Quality: TypeScript strict, zero lint warnings, Playwright tests for the key flows.</li>
      </ul>
    </div>

    <div className={card}>
      <h2 className={heading}>Credits</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Original character, story and art. Fonts: Fraunces, Fredoka, Nunito (SIL OFL). Libraries: React, Vite, TypeScript, Tailwind CSS,
        Three.js, Lucide, canvas-confetti. Services: Netlify, Claude by Anthropic. Built with help from AI coding assistants. Source:{' '}
        <a href="https://github.com/iblamepuru/lumi-dream-atelier" className="text-[var(--accent-gold)] underline underline-offset-2">
          GitHub
        </a>
        .
      </p>
    </div>
  </section>
);
