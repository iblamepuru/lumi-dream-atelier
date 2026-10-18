import React from 'react';
import { Link } from './Link';

// A wall of classic 88x31 web badges, the way every cozy 90s homepage signed off.
interface Badge {
  top: string;
  bottom: string;
  bg: string;
  fg: string;
  to?: string;
  stripes?: boolean;
}

const BADGES: Badge[] = [
  { top: 'LUMI ✦', bottom: 'ATELIER', bg: 'linear-gradient(180deg,#29213F,#4a3a6e)', fg: '#F4C96B', to: '/' },
  { top: 'BEST VIEWED', bottom: 'AT NIGHT ☾', bg: 'linear-gradient(180deg,#130d20,#2b2147)', fg: '#B9A5E8' },
  { top: 'MADE WITH ♥', bottom: '& MOONLIGHT', bg: 'linear-gradient(180deg,#D995B7,#a34063)', fg: '#FFF8F1' },
  { top: 'SIGN MY', bottom: 'GUESTBOOK!', bg: 'linear-gradient(180deg,#F4C96B,#c99a3a)', fg: '#3b2a3f', to: '/guestbook' },
  { top: 'WEBRING', bottom: '◄ MEMBER ►', bg: 'linear-gradient(180deg,#4a6fa5,#2a3f66)', fg: '#FFF8F1', to: '/meet-lumi' },
  { top: 'NO COOKIES', bottom: 'JUST DREAMS', bg: 'linear-gradient(180deg,#BFE3D0,#7fb69a)', fg: '#1d3b2c' },
  { top: 'UNDER', bottom: 'CONSTRUCTION', bg: '#1c1629', fg: '#FACC15', stripes: true },
];

const badgeStyle = (b: Badge): React.CSSProperties => ({
  width: 88,
  height: 31,
  background: b.stripes ? 'repeating-linear-gradient(45deg,#FACC15 0 6px,#1c1629 6px 12px)' : b.bg,
  color: b.fg,
  border: '2px outset #d8d0e8',
  fontFamily: "'Courier New', ui-monospace, monospace",
  fontSize: 9,
  fontWeight: 700,
  lineHeight: '11px',
  letterSpacing: '0.02em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  imageRendering: 'pixelated',
});

export const EarlyWebBadges: React.FC = () => (
  <div className="space-y-3">
    <ul aria-label="Web badges" className="flex flex-wrap justify-center gap-2">
      {BADGES.map((b) => {
        const label = (
          <span style={badgeStyle(b)}>
            <span style={b.stripes ? { background: '#1c1629', padding: '0 3px' } : undefined}>{b.top}</span>
            <span style={b.stripes ? { background: '#1c1629', padding: '0 3px' } : undefined}>{b.bottom}</span>
          </span>
        );
        return (
          <li key={b.top + b.bottom}>
            {b.to ? (
              <Link to={b.to} className="block hover:-translate-y-0.5 transition-transform" aria-label={`${b.top} ${b.bottom}`}>
                {label}
              </Link>
            ) : (
              label
            )}
          </li>
        );
      })}
    </ul>
    <p className="text-center text-[11px] font-mono text-[var(--text-muted)]">
      ✦ Last updated: 18 Oct 2026 ✦ Hand-sewn HTML, no tracking ✦
    </p>
  </div>
);
