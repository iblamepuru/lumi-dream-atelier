import React from 'react';
import { PAGES } from '../router';
import { Link } from './Link';
import { useAtelier } from '../context/AtelierContext';
import { playChime } from '../utils/soundEngine';

interface WebringProps {
  path: string;
}

// A little 90s-style webring that links every page of Lumi's site into one loop.
export const Webring: React.FC<WebringProps> = ({ path }) => {
  const { state } = useAtelier();
  const index = Math.max(0, PAGES.findIndex((p) => p.path === path));
  const prev = PAGES[(index - 1 + PAGES.length) % PAGES.length];
  const next = PAGES[(index + 1) % PAGES.length];
  const chime = () => playChime(state.isMuted, 698.46);

  return (
    <nav
      aria-label="Lumi's webring"
      className="max-w-4xl mx-auto my-10 px-4 sm:px-6"
    >
      <div className="rounded-2xl border-2 border-dashed border-[var(--border-glow)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold">
          <Link
            to={prev.path}
            onClick={chime}
            className="px-3 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors min-h-[40px] inline-flex items-center gap-1"
          >
            <span aria-hidden="true">◄</span>
            <span className="sr-only">Previous page: </span>
            <span>{prev.label}</span>
          </Link>
          <span className="text-center font-serif text-[var(--accent-gold)] text-[11px] sm:text-sm leading-tight">
            ✦ Lumi's Webring ✦
            <span className="block text-[10px] font-sans font-semibold text-[var(--text-muted)]">
              page {index + 1} of {PAGES.length}
            </span>
          </span>
          <Link
            to={next.path}
            onClick={chime}
            className="px-3 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors min-h-[40px] inline-flex items-center gap-1"
          >
            <span className="sr-only">Next page: </span>
            <span>{next.label}</span>
            <span aria-hidden="true">►</span>
          </Link>
        </div>

        {/* Every stop on the ring, like an old site map */}
        <ul className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-wrap justify-center gap-x-1 gap-y-1.5 text-[11px] sm:text-xs">
          {PAGES.map((p, i) => (
            <li key={p.path} className="inline-flex items-center gap-1">
              {i > 0 && <span className="text-[var(--text-muted)]" aria-hidden="true">·</span>}
              <Link
                to={p.path}
                onClick={chime}
                aria-current={p.path === path ? 'page' : undefined}
                title={p.blurb}
                className={`px-1.5 py-0.5 rounded underline-offset-2 ${
                  p.path === path
                    ? 'text-[var(--accent-gold)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline'
                }`}
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
