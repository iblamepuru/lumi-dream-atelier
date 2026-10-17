import React from 'react';
import type { LumiMood, LanternColor } from '../types/atelier';
import { useEyeTracking } from '../hooks/useEyeTracking';

interface LumiCharacterProps {
  mood?: LumiMood;
  size?: number | string;
  lanternColor?: LanternColor;
  enableEyeTracking?: boolean;
  hasGoldenCrown?: boolean;
  className?: string;
  onClick?: () => void;
}

const LANTERN_GLOW_COLORS: Record<LanternColor, { core: string; glow: string; glass: string }> = {
  gold: { core: '#FFF5C2', glow: '#F4C96B', glass: 'rgba(244, 201, 107, 0.45)' },
  lavender: { core: '#EFE7FF', glow: '#B9A5E8', glass: 'rgba(185, 165, 232, 0.45)' },
  rose: { core: '#FFE8F2', glow: '#D995B7', glass: 'rgba(217, 149, 183, 0.45)' },
  ice: { core: '#E0F2FE', glow: '#7DD3FC', glass: 'rgba(125, 211, 252, 0.45)' },
};

export const LumiCharacter: React.FC<LumiCharacterProps> = ({
  mood = 'happy',
  size = 280,
  lanternColor = 'gold',
  enableEyeTracking = true,
  hasGoldenCrown = false,
  className = '',
  onClick,
}) => {
  const { targetRef, pupilOffset } = useEyeTracking(enableEyeTracking && mood !== 'sleepy' && mood !== 'celebrating', 3.8);

  const colors = LANTERN_GLOW_COLORS[lanternColor] || LANTERN_GLOW_COLORS.gold;

  // Eye configurations based on mood
  const renderEyes = () => {
    if (mood === 'sleepy') {
      return (
        <g id="lumi-eyes-sleepy">
          {/* Half-closed gentle eyelids */}
          <path d="M 125 152 Q 133 160 141 152" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 159 152 Q 167 160 175 152" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Gentle sleepy blush */}
          <ellipse cx="127" cy="160" rx="7" ry="4" fill="#D995B7" opacity="0.65" />
          <ellipse cx="173" cy="160" rx="7" ry="4" fill="#D995B7" opacity="0.65" />
        </g>
      );
    }

    if (mood === 'celebrating') {
      return (
        <g id="lumi-eyes-celebrating">
          {/* Joyful arched closed eyes ^ ^ */}
          <path d="M 125 154 Q 133 145 141 154" stroke="#5C4033" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 159 154 Q 167 145 175 154" stroke="#5C4033" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Happy blush */}
          <ellipse cx="127" cy="159" rx="8" ry="5" fill="#D995B7" opacity="0.75" />
          <ellipse cx="173" cy="159" rx="8" ry="5" fill="#D995B7" opacity="0.75" />
          {/* Sparkles near eyes */}
          <polygon points="120,140 122,143 125,145 122,147 120,150 118,147 115,145 118,143" fill="#F4C96B" />
          <polygon points="180,140 182,143 185,145 182,147 180,150 178,147 175,145 178,143" fill="#F4C96B" />
        </g>
      );
    }

    // Default, curious, focused eyes with bounded tracking
    const px = pupilOffset.x;
    const py = pupilOffset.y;

    const leftEyeRadius = mood === 'curious' ? 10.5 : 10;
    const rightEyeRadius = mood === 'curious' ? 9.5 : 10;

    return (
      <g id="lumi-eyes-active">
        {/* Left Eye Sockets */}
        <circle cx="133" cy="150" r={leftEyeRadius} fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.5" />
        {/* Left Pupil (amber-plum) */}
        <g transform={`translate(${px}, ${py})`}>
          <circle cx="133" cy="150" r="7.5" fill="#5C4033" />
          <circle cx="133" cy="150" r="6" fill="#844C73" />
          <circle cx="133" cy="151.5" r="4" fill="#C26D99" />
          {/* Specular Catchlights */}
          <circle cx="131" cy="147.5" r="2.4" fill="#FFFFFF" />
          <circle cx="135.5" cy="152.5" r="1.2" fill="#FFFFFF" />
        </g>

        {/* Right Eye Sockets */}
        <circle cx="167" cy="150" r={rightEyeRadius} fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.5" />
        {/* Right Pupil */}
        <g transform={`translate(${px}, ${py})`}>
          <circle cx="167" cy="150" r="7.5" fill="#5C4033" />
          <circle cx="167" cy="150" r="6" fill="#844C73" />
          <circle cx="167" cy="151.5" r="4" fill="#C26D99" />
          {/* Specular Catchlights */}
          <circle cx="165" cy="147.5" r="2.4" fill="#FFFFFF" />
          <circle cx="169.5" cy="152.5" r="1.2" fill="#FFFFFF" />
        </g>

        {/* Rosy Cheeks */}
        <ellipse cx="124" cy="158" rx="6.5" ry="4" fill="#D995B7" opacity="0.6" />
        <ellipse cx="176" cy="158" rx="6.5" ry="4" fill="#D995B7" opacity="0.6" />
      </g>
    );
  };

  // Mouth expressions based on mood
  const renderMouth = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return <path d="M 145 162 Q 150 167 155 162" stroke="#5C4033" strokeWidth="2.2" strokeLinecap="round" fill="none" />;
      case 'curious':
        return <ellipse cx="150" cy="163" rx="2.2" ry="2.8" fill="#5C4033" />;
      case 'focused':
        return <line x1="146" y1="163" x2="154" y2="163" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />;
      case 'sleepy':
        return <path d="M 147 163 Q 150 165 153 163" stroke="#5C4033" strokeWidth="1.8" strokeLinecap="round" fill="none" />;
    }
  };

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg
        ref={targetRef}
        viewBox="0 0 300 300"
        className="w-full h-full overflow-visible drop-shadow-md"
        aria-label={`Lumi the moon moth, currently looking ${mood}`}
        role="img"
      >
        <defs>
          {/* Lantern Glow Filter */}
          <radialGradient id={`lantern-glow-${lanternColor}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.core} stopOpacity="1" />
            <stop offset="45%" stopColor={colors.glow} stopOpacity="0.75" />
            <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
          </radialGradient>

          {/* Wing Gradient */}
          <linearGradient id="lumi-wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CBB8F5" />
            <stop offset="60%" stopColor="#B9A5E8" />
            <stop offset="100%" stopColor="#8A74B8" />
          </linearGradient>

          <linearGradient id="lumi-wing-lower" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B29DE3" />
            <stop offset="100%" stopColor="#715C9C" />
          </linearGradient>

          {/* Plush Body Gradient */}
          <linearGradient id="lumi-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="70%" stopColor="#FFF5EB" />
            <stop offset="100%" stopColor="#F5E4D8" />
          </linearGradient>

          {/* Knitted Scarf Gradient */}
          <linearGradient id="lumi-scarf-grad" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#E5A6C4" />
            <stop offset="50%" stopColor="#D995B7" />
            <stop offset="100%" stopColor="#B66C93" />
          </linearGradient>

          {/* Soft Filter for ambient aura */}
          <filter id="soft-glow-lumi" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Warm Golden Aura */}
        <circle
          cx="150"
          cy="165"
          r="95"
          fill="url(#lantern-glow-gold)"
          opacity="0.22"
          className="animate-pulse-glow"
        />

        {/* LOWER WINGS (Behind body) */}
        <g id="lumi-lower-wings">
          {/* Left Lower Wing */}
          <g style={{ transformOrigin: '130px 185px' }} className="animate-float-gentle">
            <ellipse
              cx="110"
              cy="200"
              rx="32"
              ry="42"
              fill="url(#lumi-wing-lower)"
              stroke="#5C4033"
              strokeWidth="1.5"
              transform="rotate(22 110 200)"
            />
            {/* Soft inner glow petal */}
            <ellipse cx="112" cy="198" rx="20" ry="28" fill="#FFF8F1" opacity="0.3" transform="rotate(22 112 198)" />
          </g>

          {/* Right Lower Wing */}
          <g style={{ transformOrigin: '170px 185px' }} className="animate-float-gentle">
            <ellipse
              cx="190"
              cy="200"
              rx="32"
              ry="42"
              fill="url(#lumi-wing-lower)"
              stroke="#5C4033"
              strokeWidth="1.5"
              transform="rotate(-22 190 200)"
            />
            <ellipse cx="188" cy="198" rx="20" ry="28" fill="#FFF8F1" opacity="0.3" transform="rotate(-22 188 198)" />
          </g>
        </g>

        {/* UPPER WINGS (With crescent markings) */}
        <g id="lumi-upper-wings">
          {/* Left Upper Wing */}
          <g style={{ transformOrigin: '135px 165px' }} className="animate-float-gentle">
            <path
              d="M 135 165 C 90 120, 60 130, 68 175 C 75 210, 110 205, 135 180 Z"
              fill="url(#lumi-wing-grad)"
              stroke="#5C4033"
              strokeWidth="1.8"
            />
            {/* Wing Crescent Motif */}
            <path
              d="M 85 155 A 14 14 0 0 1 100 178 A 19 19 0 0 0 85 155"
              fill="#F4C96B"
              stroke="#E8B548"
              strokeWidth="0.8"
            />
            {/* Delicate wing shimmer vein */}
            <path
              d="M 130 170 Q 100 160 82 170"
              stroke="rgba(255, 248, 241, 0.55)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Right Upper Wing */}
          <g style={{ transformOrigin: '165px 165px' }} className="animate-float-gentle">
            <path
              d="M 165 165 C 210 120, 240 130, 232 175 C 225 210, 190 205, 165 180 Z"
              fill="url(#lumi-wing-grad)"
              stroke="#5C4033"
              strokeWidth="1.8"
            />
            {/* Wing Crescent Motif */}
            <path
              d="M 215 155 A 14 14 0 0 0 200 178 A 19 19 0 0 1 215 155"
              fill="#F4C96B"
              stroke="#E8B548"
              strokeWidth="0.8"
            />
            <path
              d="M 170 170 Q 200 160 218 170"
              stroke="rgba(255, 248, 241, 0.55)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>

        {/* PEAR-SHAPED BODY & LEGS */}
        <g id="lumi-body">
          {/* Tiny cute feet */}
          <ellipse cx="140" cy="236" rx="6" ry="4" fill="#B9A5E8" stroke="#5C4033" strokeWidth="1.2" />
          <ellipse cx="160" cy="236" rx="6" ry="4" fill="#B9A5E8" stroke="#5C4033" strokeWidth="1.2" />

          {/* Lower Body (Fluffy pear abdomen) */}
          <path
            d="M 130 175 C 115 195, 118 232, 150 234 C 182 232, 185 195, 170 175 Z"
            fill="url(#lumi-body-grad)"
            stroke="#5C4033"
            strokeWidth="2"
          />

          {/* Soft abdomen down texture stripes */}
          <path d="M 138 200 Q 150 204 162 200" stroke="#EAD5C5" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 141 213 Q 150 216 159 213" stroke="#EAD5C5" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Crossbody Satchel Strap */}
          <path
            d="M 133 174 L 165 212"
            stroke="#6B4B38"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Satchel Bag (with dream shards peeking) */}
          <rect x="156" y="200" width="18" height="15" rx="3.5" fill="#7D5843" stroke="#5C4033" strokeWidth="1.5" />
          <polygon points="156,200 165,206 174,200" fill="#6B4B38" />
          <circle cx="165" cy="207" r="1.5" fill="#F4C96B" />
          {/* Pastel dream crystal shard peeking out */}
          <polygon points="160,196 164,191 167,196 163,200" fill="#93C5FD" stroke="#60A5FA" strokeWidth="0.8" />
          <polygon points="167,197 170,193 173,198" fill="#F472B6" opacity="0.85" />
        </g>

        {/* HEAD & FACE */}
        <g id="lumi-head">
          {/* Head Ellipse */}
          <ellipse
            cx="150"
            cy="150"
            rx="33"
            ry="28"
            fill="url(#lumi-body-grad)"
            stroke="#5C4033"
            strokeWidth="2"
          />

          {/* ANTENNAE with golden crescent tips */}
          <g id="lumi-antennae">
            {/* Left Antenna */}
            <path
              d="M 140 126 C 130 95, 110 88, 102 96"
              stroke="#5C4033"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left crescent tip */}
            <path
              d="M 98 90 A 6 6 0 0 1 106 102 A 8 8 0 0 0 98 90"
              fill="#F4C96B"
              stroke="#DCA334"
              strokeWidth="1"
            />
            {/* Right Antenna */}
            <path
              d="M 160 126 C 170 95, 190 88, 198 96"
              stroke="#5C4033"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right crescent tip */}
            <path
              d="M 202 90 A 6 6 0 0 0 194 102 A 8 8 0 0 1 202 90"
              fill="#F4C96B"
              stroke="#DCA334"
              strokeWidth="1"
            />
          </g>

          {/* Eyes & Cheeks */}
          {renderEyes()}

          {/* Mouth */}
          {renderMouth()}
        </g>

        {/* KNITTED ROSE SCARF (Around neck) */}
        <g id="lumi-scarf">
          {/* Scarf main coil */}
          <path
            d="M 125 168 Q 150 178 175 168 Q 178 178 150 180 Q 122 178 125 168 Z"
            fill="url(#lumi-scarf-grad)"
            stroke="#5C4033"
            strokeWidth="2"
          />
          {/* Knit ribbing details */}
          <path d="M 136 171 L 138 177" stroke="#FFF8F1" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
          <path d="M 145 173 L 147 179" stroke="#FFF8F1" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
          <path d="M 155 173 L 157 179" stroke="#FFF8F1" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
          <path d="M 164 171 L 166 177" stroke="#FFF8F1" strokeWidth="1" opacity="0.6" strokeLinecap="round" />

          {/* Scarf Hanging Tail (fluttering gently) */}
          <path
            d="M 154 178 Q 158 198 153 214 Q 146 215 146 195 Q 148 180 154 178 Z"
            fill="url(#lumi-scarf-grad)"
            stroke="#5C4033"
            strokeWidth="1.5"
            className="animate-float-gentle"
          />
          {/* Scarf fringe */}
          <line x1="147" y1="214" x2="147" y2="218" stroke="#D995B7" strokeWidth="1.5" />
          <line x1="150" y1="214" x2="150" y2="219" stroke="#D995B7" strokeWidth="1.5" />
          <line x1="153" y1="214" x2="153" y2="218" stroke="#D995B7" strokeWidth="1.5" />
        </g>

        {/* BRASS LANTERN & HAND (Held by Lumi) */}
        <g id="lumi-lantern-arm">
          {/* Left Little Arm holding lantern handle */}
          <path
            d="M 130 176 Q 112 186 100 196"
            stroke="#5C4033"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 130 176 Q 112 186 100 196"
            stroke="#FFF5EB"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lantern Hanging Handle */}
          <path
            d="M 100 196 Q 96 205 96 212"
            stroke="#8A6B29"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Outer Lantern Aura Glow */}
          <circle
            cx="96"
            cy="225"
            r="38"
            fill={`url(#lantern-glow-${lanternColor})`}
            opacity="0.8"
            className="animate-pulse-glow"
          />

          {/* Lantern Cap (Brass) */}
          <path
            d="M 86 214 L 106 214 L 102 210 L 90 210 Z"
            fill="#D4AF37"
            stroke="#5C4033"
            strokeWidth="1.2"
          />
          <circle cx="96" cy="209" r="2.5" fill="#F4C96B" stroke="#5C4033" strokeWidth="1" />

          {/* Lantern Glass Body */}
          <rect
            x="87"
            y="214"
            width="18"
            height="22"
            rx="3"
            fill={colors.glass}
            stroke="#8A6B29"
            strokeWidth="1.5"
          />

          {/* Inside: Floating Star Spec */}
          <g className="animate-star-twinkle" style={{ transformOrigin: '96px 225px' }}>
            <polygon
              points="96,220 98,223.5 102,224 99,226.5 100,230 96,228 92,230 93,226.5 90,224 94,223.5"
              fill={colors.core}
              stroke={colors.glow}
              strokeWidth="0.8"
            />
          </g>

          {/* Lantern Base (Brass) */}
          <rect
            x="85"
            y="236"
            width="22"
            height="4"
            rx="1.5"
            fill="#D4AF37"
            stroke="#5C4033"
            strokeWidth="1.2"
          />
        </g>

        {/* SECRET ASTRAL CROWN (Only when all 5 stars found or explicitly requested) */}
        {hasGoldenCrown && (
          <g id="lumi-golden-crown" className="animate-pulse-glow" style={{ transformOrigin: '150px 120px' }}>
            {/* Golden Star Circlet */}
            <path
              d="M 132 122 Q 150 118 168 122"
              stroke="#F4C96B"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Center Crown Star */}
            <polygon
              points="150,108 152.5,114 158,114.5 154,118 155.5,123.5 150,120.5 144.5,123.5 146,118 142,114.5 147.5,114"
              fill="#F4C96B"
              stroke="#FFF5EB"
              strokeWidth="0.8"
            />
            {/* Left Tiny Star */}
            <polygon
              points="136,114 137.5,117.5 141,118 138.5,120 139.5,123.5 136,121.5 132.5,123.5 133.5,120 131,118 134.5,117.5"
              fill="#F4C96B"
            />
            {/* Right Tiny Star */}
            <polygon
              points="164,114 165.5,117.5 169,118 166.5,120 167.5,123.5 164,121.5 160.5,123.5 161.5,120 159,118 162.5,117.5"
              fill="#F4C96B"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
