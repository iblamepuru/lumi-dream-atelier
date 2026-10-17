import React, { forwardRef, useImperativeHandle } from 'react';
import { useEyeTracking } from '../hooks/useEyeTracking';
import type { FriendConfig, FriendKind } from './friendOptions';

// Parametric SVG renderer for a visitor-made Dream Friend (viewBox 200 x 200).

interface Layout {
  eyeY: number;
  eyeGap: number;
  eyeScale: number;
  mouthY: number;
  headTop: number;
  neckY: number;
}

const LAYOUT: Record<FriendKind, Layout> = {
  ghost: { eyeY: 92, eyeGap: 18, eyeScale: 1, mouthY: 112, headTop: 42, neckY: 122 },
  cloud: { eyeY: 104, eyeGap: 17, eyeScale: 0.95, mouthY: 121, headTop: 58, neckY: 146 },
  robot: { eyeY: 92, eyeGap: 17, eyeScale: 0.95, mouthY: 108, headTop: 56, neckY: 136 },
  alien: { eyeY: 98, eyeGap: 20, eyeScale: 1.3, mouthY: 124, headTop: 54, neckY: 146 },
  monster: { eyeY: 102, eyeGap: 19, eyeScale: 1.1, mouthY: 124, headTop: 60, neckY: 156 },
  you: { eyeY: 106, eyeGap: 17, eyeScale: 0.95, mouthY: 126, headTop: 58, neckY: 152 },
};

const INK = '#3B2A3F';

/** Darken (amount < 0) or lighten (amount > 0) a #rrggbb colour. */
const shade = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const Body: React.FC<{ friend: FriendConfig }> = ({ friend }) => {
  const fill = friend.kind === 'you' ? friend.skin : friend.color;
  const edge = shade(fill, -0.22);
  const common = { fill, stroke: edge, strokeWidth: 2.5, strokeLinejoin: 'round' as const };

  switch (friend.kind) {
    case 'ghost':
      return (
        <g>
          <ellipse cx="40" cy="118" rx="11" ry="7" fill={fill} stroke={edge} strokeWidth="2.5" transform="rotate(-25 40 118)" />
          <ellipse cx="160" cy="118" rx="11" ry="7" fill={fill} stroke={edge} strokeWidth="2.5" transform="rotate(25 160 118)" />
          <path
            {...common}
            d="M48 112 Q48 40 100 40 Q152 40 152 112 L152 166 Q143 156 134 166 Q125 176 117 166 Q108 156 100 166 Q91 176 83 166 Q74 156 66 166 Q57 176 48 166 Z"
          />
        </g>
      );
    case 'cloud':
      return (
        <g {...common}>
          <circle cx="62" cy="126" r="24" />
          <circle cx="138" cy="126" r="24" />
          <circle cx="72" cy="104" r="30" />
          <circle cx="128" cy="104" r="30" />
          <circle cx="100" cy="88" r="34" />
          <circle cx="100" cy="128" r="32" />
          {/* Fill over the inner outlines so only the puffy silhouette shows */}
          <g stroke="none">
            <circle cx="62" cy="126" r="22.5" />
            <circle cx="138" cy="126" r="22.5" />
            <circle cx="72" cy="104" r="28.5" />
            <circle cx="128" cy="104" r="28.5" />
            <circle cx="100" cy="88" r="32.5" />
            <circle cx="100" cy="128" r="30.5" />
          </g>
        </g>
      );
    case 'robot':
      return (
        <g>
          <line x1="100" y1="56" x2="100" y2="36" stroke={edge} strokeWidth="3" />
          <circle cx="100" cy="32" r="7" fill="#F4C96B" stroke="#C99A3A" strokeWidth="2" />
          <rect x="70" y="134" width="60" height="38" rx="10" {...common} />
          <path d="M100 160 l-7 -7 a4.5 4.5 0 0 1 7 -5 a4.5 4.5 0 0 1 7 5 z" fill="#D995B7" />
          <rect x="40" y="82" width="12" height="28" rx="5" {...common} />
          <rect x="148" y="82" width="12" height="28" rx="5" {...common} />
          <rect x="50" y="56" width="100" height="82" rx="20" {...common} />
          <rect x="62" y="70" width="76" height="52" rx="12" fill="#2A2340" stroke={edge} strokeWidth="2" />
          <circle cx="58" cy="64" r="2.5" fill={edge} />
          <circle cx="142" cy="64" r="2.5" fill={edge} />
        </g>
      );
    case 'alien':
      return (
        <g>
          <line x1="80" y1="62" x2="66" y2="30" stroke={edge} strokeWidth="3" strokeLinecap="round" />
          <line x1="120" y1="62" x2="134" y2="30" stroke={edge} strokeWidth="3" strokeLinecap="round" />
          <circle cx="66" cy="28" r="7" fill="#F4C96B" stroke="#C99A3A" strokeWidth="2" />
          <circle cx="134" cy="28" r="7" fill="#F4C96B" stroke="#C99A3A" strokeWidth="2" />
          <ellipse cx="100" cy="166" rx="30" ry="16" {...common} />
          <path {...common} d="M100 52 C150 52 160 90 150 120 C140 148 120 156 100 156 C80 156 60 148 50 120 C40 90 50 52 100 52 Z" />
        </g>
      );
    case 'monster': {
      const tufts = Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return { x: 100 + Math.cos(a) * 52, y: 110 + Math.sin(a) * 50 };
      });
      return (
        <g>
          <path d="M70 70 L62 44 L84 62 Z" fill="#FFF8F1" stroke={edge} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M130 70 L138 44 L116 62 Z" fill="#FFF8F1" stroke={edge} strokeWidth="2.5" strokeLinejoin="round" />
          {tufts.map((t, i) => (
            <circle key={i} cx={t.x} cy={t.y} r="11" fill={fill} stroke={edge} strokeWidth="2.5" />
          ))}
          <ellipse cx="100" cy="110" rx="55" ry="53" fill={fill} />
        </g>
      );
    }
    case 'you':
      return (
        <g>
          <circle cx="54" cy="110" r="10" {...common} />
          <circle cx="146" cy="110" r="10" {...common} />
          <rect x="78" y="146" width="44" height="26" rx="12" fill={shade(friend.color, 0.55)} stroke={shade(friend.color, 0.2)} strokeWidth="2.5" />
          <circle cx="100" cy="108" r="48" {...common} />
          {/* Hair: a soft fringe with a curl on top */}
          <path
            d="M54 104 C52 66 76 52 100 52 C128 52 150 68 146 104 C138 88 124 80 112 84 C100 74 84 78 76 88 C68 86 58 94 54 104 Z"
            fill={friend.color}
            stroke={shade(friend.color, -0.25)}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M100 54 C96 42 106 36 110 44" fill="none" stroke={friend.color} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
  }
};

const Face: React.FC<{ friend: FriendConfig; look: { x: number; y: number } }> = ({ friend, look }) => {
  const L = LAYOUT[friend.kind];
  const left = 100 - L.eyeGap;
  const right = 100 + L.eyeGap;
  const s = L.eyeScale;
  const onScreen = friend.kind === 'robot';
  const eyeInk = onScreen ? '#BFF4FF' : INK;
  const mouthInk = onScreen ? '#BFF4FF' : INK;

  const openEye = (cx: number, big = false) => (
    <g transform={`translate(${look.x} ${look.y})`}>
      {big && <circle cx={cx} cy={L.eyeY} r={9 * s} fill="#FFFFFF" stroke={eyeInk} strokeWidth="2" />}
      <ellipse cx={cx} cy={L.eyeY} rx={(big ? 5 : 5.5) * s} ry={(big ? 5 : 7) * s} fill={eyeInk} />
      {!onScreen && <circle cx={cx - 1.8 * s} cy={L.eyeY - 2.4 * s} r={1.9 * s} fill="#FFFFFF" />}
    </g>
  );
  const closedEye = (cx: number, up: boolean) => (
    <path
      d={up ? `M${cx - 7 * s} ${L.eyeY + 2} Q${cx} ${L.eyeY - 6} ${cx + 7 * s} ${L.eyeY + 2}` : `M${cx - 7 * s} ${L.eyeY - 1} Q${cx} ${L.eyeY + 6} ${cx + 7 * s} ${L.eyeY - 1}`}
      fill="none"
      stroke={eyeInk}
      strokeWidth="3"
      strokeLinecap="round"
    />
  );

  let eyes: React.ReactNode;
  let mouth: React.ReactNode;
  switch (friend.mood) {
    case 'sleepy':
      eyes = (
        <>
          {closedEye(left, false)}
          {closedEye(right, false)}
        </>
      );
      mouth = <ellipse cx="100" cy={L.mouthY} rx="3.5" ry="4.5" fill={mouthInk} />;
      break;
    case 'surprised':
      eyes = (
        <>
          {openEye(left, true)}
          {openEye(right, true)}
        </>
      );
      mouth = <ellipse cx="100" cy={L.mouthY + 1} rx="6" ry="7.5" fill={mouthInk} />;
      break;
    case 'wink':
      eyes = (
        <>
          {closedEye(left, true)}
          {openEye(right)}
        </>
      );
      mouth = (
        <g>
          <path d={`M88 ${L.mouthY - 3} Q100 ${L.mouthY + 9} 112 ${L.mouthY - 3}`} fill="none" stroke={mouthInk} strokeWidth="3" strokeLinecap="round" />
          <path d={`M98 ${L.mouthY + 2} q4 7 8 0`} fill="#E58FA8" />
        </g>
      );
      break;
    default:
      eyes = (
        <>
          {openEye(left)}
          {openEye(right)}
        </>
      );
      mouth = (
        <path d={`M90 ${L.mouthY - 3} Q100 ${L.mouthY + 7} 110 ${L.mouthY - 3}`} fill="none" stroke={mouthInk} strokeWidth="3" strokeLinecap="round" />
      );
  }

  return (
    <g>
      {onScreen ? (
        <g fill="#F6A6C1" opacity="0.8">
          <rect x={left - 14} y={L.eyeY + 9} width="6" height="4" rx="1" />
          <rect x={right + 8} y={L.eyeY + 9} width="6" height="4" rx="1" />
        </g>
      ) : (
        <g fill="#F2A2BC" opacity="0.6">
          <ellipse cx={left - 9} cy={L.eyeY + 13} rx="7" ry="4.5" />
          <ellipse cx={right + 9} cy={L.eyeY + 13} rx="7" ry="4.5" />
        </g>
      )}
      {eyes}
      {mouth}
      {friend.kind === 'monster' && (
        <g fill="#FFFFFF" stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
          <path d={`M93 ${L.mouthY + 1} l3 6 l3 -6 z`} />
          <path d={`M101 ${L.mouthY + 1} l3 6 l3 -6 z`} />
        </g>
      )}
      {friend.mood === 'sleepy' && (
        <text x="150" y={L.headTop + 4} fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="16" fill="#B9A5E8">
          z<tspan dx="2" dy="-8" fontSize="12">z</tspan>
        </text>
      )}
    </g>
  );
};

const Accessory: React.FC<{ friend: FriendConfig }> = ({ friend }) => {
  const { headTop, neckY } = LAYOUT[friend.kind];
  switch (friend.accessory) {
    case 'nightcap':
      return (
        <g>
          <path
            d={`M68 ${headTop + 12} Q72 ${headTop - 14} 110 ${headTop - 22} Q140 ${headTop - 28} 158 ${headTop - 6} Q140 ${headTop - 14} 132 ${headTop + 12} Z`}
            fill="#B9A5E8"
            stroke="#8E78C7"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="64" y={headTop + 6} width="72" height="12" rx="6" fill="#FFF8F1" stroke="#8E78C7" strokeWidth="2" />
          <circle cx="160" cy={headTop - 4} r="7" fill="#FFF8F1" stroke="#8E78C7" strokeWidth="2" />
          {/* little crescent moon on the cap */}
          <path d={`M102 ${headTop - 12} a7 7 0 1 0 7 9 a5.5 5.5 0 1 1 -7 -9 z`} fill="#F4C96B" />
        </g>
      );
    case 'flowers':
      return (
        <g>
          {[-2, -1, 0, 1, 2].map((i) => {
            const x = 100 + i * 15;
            const y = headTop + 6 + Math.abs(i) * 3;
            const petal = ['#F6C1D4', '#F4D58D', '#B9A5E8', '#A8D8F0', '#F6C1D4'][i + 2];
            return (
              <g key={i}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <circle key={deg} cx={x + Math.cos((deg * Math.PI) / 180) * 4.5} cy={y + Math.sin((deg * Math.PI) / 180) * 4.5} r="3.6" fill={petal} />
                ))}
                <circle cx={x} cy={y} r="2.8" fill="#F4C96B" />
              </g>
            );
          })}
        </g>
      );
    case 'crown':
      return (
        <g>
          <path
            d={`M74 ${headTop + 8} L72 ${headTop - 18} L87 ${headTop - 4} L100 ${headTop - 24} L113 ${headTop - 4} L128 ${headTop - 18} L126 ${headTop + 8} Z`}
            fill="#F4C96B"
            stroke="#C99A3A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="100" cy={headTop - 2} r="3.5" fill="#D995B7" />
          <circle cx="72" cy={headTop - 20} r="2.5" fill="#FFF8F1" />
          <circle cx="128" cy={headTop - 20} r="2.5" fill="#FFF8F1" />
          <circle cx="100" cy={headTop - 26} r="2.5" fill="#FFF8F1" />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <rect x="66" y={neckY - 6} width="68" height="14" rx="7" fill="#D995B7" stroke="#B26E92" strokeWidth="2.5" />
          <path d={`M112 ${neckY + 4} l6 24 l12 -3 l-6 -22 z`} fill="#D995B7" stroke="#B26E92" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={`M76 ${neckY - 4} v10 M88 ${neckY - 4} v10 M100 ${neckY - 4} v10`} stroke="#F6C1D4" strokeWidth="2" />
        </g>
      );
    case 'bow':
      return (
        <g transform={`translate(128 ${headTop + 6}) rotate(18)`}>
          <path d="M0 0 L-16 -10 L-16 10 Z" fill="#F6C1D4" stroke="#C97A98" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M0 0 L16 -10 L16 10 Z" fill="#F6C1D4" stroke="#C97A98" strokeWidth="2.5" strokeLinejoin="round" />
          <circle r="4.5" fill="#E58FA8" stroke="#C97A98" strokeWidth="2" />
        </g>
      );
    default:
      return null;
  }
};

interface DreamFriendProps {
  friend: FriendConfig;
  size?: number | string;
  track?: boolean;
  className?: string;
}

export interface DreamFriendHandle {
  /** The live <svg> element, used to export a keepsake PNG. */
  svg: SVGSVGElement | null;
}

export const DreamFriend = forwardRef<DreamFriendHandle, DreamFriendProps>(({ friend, size = 220, track = true, className = '' }, ref) => {
  const { targetRef, pupilOffset } = useEyeTracking(track && friend.mood !== 'sleepy', 3);
  useImperativeHandle(ref, () => ({
    get svg() {
      return targetRef.current;
    },
  }));

  const label = `${friend.name || 'A dream friend'}, a ${friend.kind === 'you' ? 'fantastical you' : friend.kind}`;

  return (
    <svg
      ref={targetRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={`overflow-visible ${className}`}
    >
      <ellipse cx="100" cy="186" rx="44" ry="7" fill="#000000" opacity="0.18" />
      <Body friend={friend} />
      {friend.accessory === 'scarf' && <Accessory friend={friend} />}
      <Face friend={friend} look={pupilOffset} />
      {friend.accessory !== 'scarf' && <Accessory friend={friend} />}
    </svg>
  );
});

DreamFriend.displayName = 'DreamFriend';
