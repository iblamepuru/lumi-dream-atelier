import React, { useState, useRef } from 'react';
import { useAtelier } from '../context/AtelierContext';
import type { LanternShape, LanternColor, LanternSymbol, ThemeMode } from '../types/atelier';
import { HiddenStar } from '../components/HiddenStar';
import { playChime, playSnap, playSparkle } from '../utils/soundEngine';
import { Download, Sparkles, Check, Star, Moon, Flower2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const SUGGESTIONS = [
  'The Velvet Cloud Express',
  'Whispers of the Starlight Whale',
  'Paper Boat Across the Moon',
  'The Lullaby of Polaris',
  'Castle of Spun Stardust',
];

const BLESSINGS: Record<LanternColor, Record<LanternSymbol, string>> = {
  gold: {
    star: 'May your brightest hopes navigate the darkest sky without faltering.',
    moon: 'May gentle silver light cradle your thoughts until morning wakes.',
    flower: 'May quiet joy bloom in your heart whenever midnight turns cold.',
    comet: 'May your boldest wishes carry you across the celestial horizon.',
  },
  lavender: {
    star: 'May peaceful slumber stitch every fragmented thought into sweet serenity.',
    moon: 'May the quiet whisper of the stars guard your sleep with gentle grace.',
    flower: 'May lavender petals soften every worry until the sunrise breaks.',
    comet: 'May starry dreams drift gently through your window on cloud-soft wings.',
  },
  rose: {
    star: 'May warm affection and radiant courage kindle every sleepy breath.',
    moon: 'May a blanket of rose-spun moonlight keep your spirits warm tonight.',
    flower: 'May kindness blossom wherever your repaired dream wanders.',
    comet: 'May your fondest memories shine like sparkling rose-gold constellations.',
  },
  ice: {
    star: 'May clear celestial vision guide your slumber through misty clouds.',
    moon: 'May tranquil, cool stillness quiet the stormiest night waves.',
    flower: 'May crystalline wonder keep your imagination forever fresh and deep.',
    comet: 'May a flash of brilliant inspiration spark in your morning thoughts.',
  },
};

const COLOR_MAP: Record<LanternColor, { hex: string; name: string; aura: string }> = {
  gold: { hex: '#F4C96B', name: 'Lantern Gold', aura: 'rgba(244, 201, 107, 0.7)' },
  lavender: { hex: '#B9A5E8', name: 'Moth Lavender', aura: 'rgba(185, 165, 232, 0.7)' },
  rose: { hex: '#D995B7', name: 'Dream Rose', aura: 'rgba(217, 149, 183, 0.7)' },
  ice: { hex: '#93C5FD', name: 'Ice Blue', aura: 'rgba(147, 197, 253, 0.7)' },
};

export const LanternStudio: React.FC<{ onNavigateToDelivery?: () => void }> = ({
  onNavigateToDelivery,
}) => {
  const { state, updateLanternConfig } = useAtelier();
  const config = state.lanternConfig;

  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleShapeChange = (shape: LanternShape) => {
    updateLanternConfig({ shape });
    playSnap(state.isMuted);
  };

  const handleColorChange = (color: LanternColor) => {
    updateLanternConfig({ color });
    playChime(state.isMuted, 659.25);
  };

  const handleSymbolChange = (symbol: LanternSymbol) => {
    updateLanternConfig({ symbol });
    playSnap(state.isMuted);
  };

  const handleGlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const glowIntensity = Number(e.target.value);
    updateLanternConfig({ glowIntensity });
  };

  const handleEnvChange = (environment: ThemeMode) => {
    updateLanternConfig({ environment });
    playChime(state.isMuted, 523.25);
  };

  const handleDreamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLanternConfig({ dreamName: e.target.value.slice(0, 40) });
  };

  const handleSelectSuggestion = (name: string) => {
    updateLanternConfig({ dreamName: name });
    playChime(state.isMuted, 783.99);
  };

  const handleCreateDreamCard = () => {
    updateLanternConfig({ cardCreated: true });
    playSparkle(state.isMuted);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: [COLOR_MAP[config.color].hex, '#FFF8F1', '#F4C96B'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // CLIENT-SIDE PNG CARD EXPORT USING CANVAS
  const handleDownloadCard = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setDownloadStatus('Rendering dream card...');

      // Dimensions: 800 x 500 (Keepsake ratio)
      canvas.width = 800;
      canvas.height = 500;

      // 1. Background gradient
      const isNight = config.environment === 'midnight';
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
      if (isNight) {
        bgGrad.addColorStop(0, '#1C1629');
        bgGrad.addColorStop(0.5, '#29213F');
        bgGrad.addColorStop(1, '#342A4F');
      } else {
        bgGrad.addColorStop(0, '#FFF9F3');
        bgGrad.addColorStop(0.5, '#F7EFE9');
        bgGrad.addColorStop(1, '#EFE1F5');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 500);

      // 2. Ornate Border
      ctx.strokeStyle = COLOR_MAP[config.color].hex;
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 460);

      ctx.strokeStyle = isNight ? 'rgba(255,248,241,0.2)' : 'rgba(92,64,51,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 28, 744, 444);

      // 3. Header Text
      ctx.fillStyle = isNight ? '#F4C96B' : '#DCA334';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('LUMI’S LITTLE ATELIER · WORKSHOP NO. 07', 50, 65);

      ctx.fillStyle = isNight ? '#FFF8F1' : '#453026';
      ctx.font = 'bold 32px serif';
      ctx.fillText(config.dreamName || 'The Starlight Voyager', 50, 110);

      // 4. Attributes Badges
      ctx.fillStyle = isNight ? '#D4C9EB' : '#6F5547';
      ctx.font = '14px sans-serif';
      ctx.fillText(
        `Vessel: ${config.shape.toUpperCase()}  |  Hue: ${COLOR_MAP[config.color].name}  |  Core: ${config.symbol.toUpperCase()}  |  Luminance: ${config.glowIntensity}%`,
        50,
        145
      );

      // 5. Glow Halo & Lantern Center
      const lanternX = 580;
      const lanternY = 250;
      const glowGrad = ctx.createRadialGradient(lanternX, lanternY, 10, lanternX, lanternY, 160);
      glowGrad.addColorStop(0, COLOR_MAP[config.color].aura);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 160, 0, Math.PI * 2);
      ctx.fill();

      // Draw lantern frame on canvas
      ctx.fillStyle = '#D4AF37';
      ctx.strokeStyle = '#5C4033';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (config.shape === 'round') {
        ctx.arc(lanternX, lanternY, 55, 0, Math.PI * 2);
      } else if (config.shape === 'star') {
        ctx.arc(lanternX, lanternY, 55, 0, Math.PI * 2);
      } else {
        ctx.arc(lanternX, lanternY, 55, 0, Math.PI * 2);
      }
      ctx.fillStyle = isNight ? 'rgba(255,248,241,0.2)' : 'rgba(255,255,255,0.7)';
      ctx.fill();
      ctx.stroke();

      // Symbol inside
      ctx.fillStyle = COLOR_MAP[config.color].hex;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      const symChar = config.symbol === 'star' ? '★' : config.symbol === 'moon' ? '☾' : config.symbol === 'flower' ? '✿' : '✦';
      ctx.fillText(symChar, lanternX, lanternY + 12);
      ctx.textAlign = 'left';

      // 6. Lumi's Blessing Quote
      const blessingText = BLESSINGS[config.color][config.symbol];
      ctx.fillStyle = isNight ? '#FFF8F1' : '#453026';
      ctx.font = 'italic 16px serif';
      ctx.fillText(`"${blessingText}"`, 50, 380);

      // 7. Footer Stamp
      ctx.fillStyle = isNight ? '#A396BE' : '#8E7465';
      ctx.font = '12px monospace';
      ctx.fillText('OFFICIAL CERTIFICATE OF RESTORATION · haX.baby TRACK 2', 50, 440);
      ctx.fillText('SEALED WITH MOONLIGHT THREAD ✦', 540, 440);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `lumi-dream-card-${config.shape}-${config.color}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadStatus('Card downloaded successfully! ✦');
      setTimeout(() => setDownloadStatus(null), 3000);
    } catch (err) {
      console.error('Failed to generate dream card PNG', err);
      setDownloadStatus('Could not export image. Please try again.');
    }
  };

  const getSymbolIcon = (sym: LanternSymbol) => {
    switch (sym) {
      case 'star':
        return <Star className="w-4 h-4 text-[#F4C96B]" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-[#B9A5E8]" />;
      case 'flower':
        return <Flower2 className="w-4 h-4 text-[#D995B7]" />;
      case 'comet':
        return <Zap className="w-4 h-4 text-[#93C5FD]" />;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Hidden canvas for PNG export */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] block">
            Invention 02 · Starlight Lantern Press
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
            Moonlight Lantern Studio
          </h3>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {state.crystalRepaired ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#F4C96B]/20 text-[var(--accent-gold)] border border-[#F4C96B]/50">
              <Check className="w-3.5 h-3.5" />
              <span>Repaired Crystal Ready</span>
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)] italic">
              ✦ Tip: Mending crystal first enriches your lantern!
            </span>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Controls Panel */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-6">
          
          {/* 1. Dream Name Input */}
          <div className="space-y-2">
            <label htmlFor="dream-name" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              1. Name Your Dream (Max 40 chars):
            </label>
            <input
              id="dream-name"
              type="text"
              value={config.dreamName}
              onChange={handleDreamNameChange}
              maxLength={40}
              placeholder="e.g. Whispers of the Starlight Whale"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-semibold focus:border-[var(--accent-gold)] focus:outline-none transition-colors"
            />
            {/* Whimsical suggestion chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-[var(--surface-badge)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Lantern Vessel Shape */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              2. Vessel Shape:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'round', label: 'Classic Globe', icon: '●' },
                { id: 'star', label: 'Astral Star', icon: '★' },
                { id: 'crescent', label: 'Moon Cradle', icon: '☾' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleShapeChange(s.id as LanternShape)}
                  aria-pressed={config.shape === s.id}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    config.shape === s.id
                      ? 'border-[#F4C96B] bg-[#F4C96B]/20 text-[var(--text-primary)] shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-glow)]'
                  }`}
                >
                  <span className="text-base text-[var(--accent-gold)]">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Lantern Color Aura */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              3. Glass Hue & Moonlight Aura:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(COLOR_MAP) as LanternColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleColorChange(c)}
                  aria-pressed={config.color === c}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    config.color === c
                      ? 'border-[#F4C96B] bg-[#F4C96B]/20 text-[var(--text-primary)] shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-glow)]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: COLOR_MAP[c].hex }}
                  />
                  <span>{COLOR_MAP[c].name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Core Symbol */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              4. Inner Core Symbol:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'star', label: 'Star' },
                { id: 'moon', label: 'Moon' },
                { id: 'flower', label: 'Petal' },
                { id: 'comet', label: 'Comet' },
              ].map((sym) => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => handleSymbolChange(sym.id as LanternSymbol)}
                  aria-pressed={config.symbol === sym.id}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    config.symbol === sym.id
                      ? 'border-[#F4C96B] bg-[#F4C96B]/20 text-[var(--text-primary)] shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-glow)]'
                  }`}
                >
                  {getSymbolIcon(sym.id as LanternSymbol)}
                  <span>{sym.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Glow Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <label htmlFor="glow-slider">5. Glow Intensity:</label>
              <span className="text-[var(--accent-gold)]">{config.glowIntensity}% Luminance</span>
            </div>
            <input
              id="glow-slider"
              type="range"
              min="20"
              max="100"
              value={config.glowIntensity}
              onChange={handleGlowChange}
              className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-[#F4C96B]"
            />
          </div>

          {/* 6. Preview Environment Switcher */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">Preview Backdrop:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEnvChange('twilight')}
                aria-pressed={config.environment === 'twilight'}
                className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                  config.environment === 'twilight'
                    ? 'border-[#DCA334] bg-[#F4C96B]/20 text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
                }`}
              >
                Twilight
              </button>
              <button
                type="button"
                onClick={() => handleEnvChange('midnight')}
                aria-pressed={config.environment === 'midnight'}
                className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                  config.environment === 'midnight'
                    ? 'border-[#B9A5E8] bg-[#29213F] text-[#FFF8F1]'
                    : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
                }`}
              >
                Midnight
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live SVG Preview & Dream Card Creation */}
        <div className="lg:col-span-6 space-y-6 relative">
          
          {/* HIDDEN STAR #4 (star-lab): Near the workbench header */}
          <div className="absolute -top-10 right-4 z-20">
            <HiddenStar
              starId="star-lab"
              label="The Workbench Anvil Star"
              hint="Tucked right beside the Starlight Lantern Press..."
            />
          </div>

          {/* LIVE LANTERN PREVIEW STAGE */}
          <div
            className={`p-8 rounded-3xl border-2 transition-all duration-500 shadow-2xl flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden ${
              config.environment === 'midnight'
                ? 'bg-[#1C1629] border-[#B9A5E8]/30 text-[#FFF8F1]'
                : 'bg-[#FFF9F3] border-[#5C4033]/15 text-[#453026]'
            }`}
          >
            {/* Ambient Background Stars inside preview */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-6 left-12 w-1.5 h-1.5 bg-[#F4C96B] rounded-full animate-star-twinkle" />
              <div className="absolute bottom-8 right-12 w-2 h-2 bg-[#FFF8F1] rounded-full animate-star-twinkle" />
              <div className="absolute top-1/2 left-8 w-1 h-1 bg-[#D995B7] rounded-full animate-star-twinkle" />
            </div>

            {/* LIVE SVG LANTERN ARTWORK */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Outer Dynamic Radial Aura */}
              <div
                className="absolute inset-0 rounded-full blur-2xl transition-all duration-300 pointer-events-none"
                style={{
                  backgroundColor: COLOR_MAP[config.color].hex,
                  opacity: (config.glowIntensity / 100) * 0.65,
                  transform: `scale(${1 + config.glowIntensity / 200})`,
                }}
              />

              <svg viewBox="0 0 240 240" className="w-full h-full relative z-10 drop-shadow-2xl">
                <defs>
                  <radialGradient id="lantern-stage-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFDF8" stopOpacity="1" />
                    <stop offset="60%" stopColor={COLOR_MAP[config.color].hex} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={COLOR_MAP[config.color].hex} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Lantern Suspension Chain */}
                <line x1="120" y1="10" x2="120" y2="40" stroke="#8A6B29" strokeWidth="2.5" />
                <circle cx="120" cy="40" r="4" fill="#D4AF37" stroke="#5C4033" strokeWidth="1" />

                {/* Top Brass Cap */}
                <path d="M 95 50 L 145 50 L 135 40 L 105 40 Z" fill="#D4AF37" stroke="#5C4033" strokeWidth="1.5" />

                {/* MAIN VESSEL SHAPES */}
                {config.shape === 'round' && (
                  <g id="vessel-round">
                    <circle cx="120" cy="115" r="55" fill="rgba(255,248,241,0.25)" stroke="#D4AF37" strokeWidth="2.5" />
                    <circle cx="120" cy="115" r="48" fill="url(#lantern-stage-glow)" opacity={(config.glowIntensity / 100) * 0.9} />
                  </g>
                )}

                {config.shape === 'star' && (
                  <g id="vessel-star">
                    <polygon
                      points="120,55 138,95 180,98 148,128 158,170 120,148 82,170 92,128 60,98 102,95"
                      fill="rgba(255,248,241,0.25)"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                    />
                    <polygon
                      points="120,65 134,100 168,102 142,126 150,160 120,142 90,160 98,126 72,102 106,100"
                      fill="url(#lantern-stage-glow)"
                      opacity={(config.glowIntensity / 100) * 0.9}
                    />
                  </g>
                )}

                {config.shape === 'crescent' && (
                  <g id="vessel-crescent">
                    <path
                      d="M 140 60 A 55 55 0 1 0 150 165 A 65 65 0 0 1 140 60"
                      fill="rgba(255,248,241,0.25)"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 135 70 A 45 45 0 1 0 143 155 A 55 55 0 0 1 135 70"
                      fill="url(#lantern-stage-glow)"
                      opacity={(config.glowIntensity / 100) * 0.9}
                    />
                  </g>
                )}

                {/* CORE SYMBOL FLOATING IN CHAMBER */}
                <g style={{ transformOrigin: '120px 115px' }} className="animate-star-twinkle">
                  {config.symbol === 'star' && (
                    <polygon
                      points="120,100 124,110 134,111 127,118 129,128 120,123 111,128 113,118 106,111 116,110"
                      fill="#FFFDF8"
                      stroke={COLOR_MAP[config.color].hex}
                      strokeWidth="1.2"
                    />
                  )}
                  {config.symbol === 'moon' && (
                    <path
                      d="M 125 102 A 14 14 0 1 0 130 128 A 16 16 0 0 1 125 102"
                      fill="#FFFDF8"
                      stroke={COLOR_MAP[config.color].hex}
                      strokeWidth="1.2"
                    />
                  )}
                  {config.symbol === 'flower' && (
                    <g>
                      <circle cx="120" cy="115" r="5" fill="#FFFDF8" />
                      <circle cx="120" cy="107" r="4" fill={COLOR_MAP[config.color].hex} />
                      <circle cx="120" cy="123" r="4" fill={COLOR_MAP[config.color].hex} />
                      <circle cx="112" cy="115" r="4" fill={COLOR_MAP[config.color].hex} />
                      <circle cx="128" cy="115" r="4" fill={COLOR_MAP[config.color].hex} />
                    </g>
                  )}
                  {config.symbol === 'comet' && (
                    <g>
                      <circle cx="115" cy="115" r="6" fill="#FFFDF8" stroke={COLOR_MAP[config.color].hex} strokeWidth="1" />
                      <path d="M 120 115 L 135 108 M 120 116 L 138 115 M 120 117 L 135 122" stroke="#FFFDF8" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                  )}
                </g>

                {/* Bottom Brass Base */}
                <rect x="100" y="172" width="40" height="7" rx="2" fill="#D4AF37" stroke="#5C4033" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Dream Name & Serial Banner */}
            <div className="mt-4 text-center z-10 space-y-1">
              <span className="text-base sm:text-lg font-serif font-bold tracking-tight block">
                {config.dreamName || 'The Starlight Voyager'}
              </span>
              <span className="text-[11px] font-mono opacity-70 block">
                WS-07 · {config.shape.toUpperCase()} · {COLOR_MAP[config.color].name}
              </span>
            </div>
          </div>

          {/* CREATE & DOWNLOAD ACTIONS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCreateDreamCard}
                className="flex-1 px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-lg hover:shadow-[0_0_20px_rgba(244,201,107,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#453026]" />
                <span>Create Dream Keepsake Card</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCard}
                className="px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--border-glow)] hover:bg-[var(--surface-badge)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>Download (PNG)</span>
              </button>
            </div>

            {/* Download Status Toast */}
            {downloadStatus && (
              <p className="text-xs font-semibold text-center text-[var(--accent-gold)] animate-pulse">
                {downloadStatus}
              </p>
            )}

            {/* GENERATED DREAM CARD PREVIEW */}
            {config.cardCreated && (
              <div className="p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl space-y-4 animate-float-gentle">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-serif font-bold tracking-wider uppercase text-[var(--accent-gold)]">
                    Official Keepsake Certificate
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4C96B]/20 text-[var(--accent-gold)] font-bold">
                    ATELIER SEALED
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-serif font-bold text-[var(--text-primary)]">
                    {config.dreamName}
                  </h4>
                  <p className="text-xs font-serif italic text-[var(--text-secondary)] leading-relaxed">
                    "{BLESSINGS[config.color][config.symbol]}"
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] pt-1">
                    — Blessed by Lumi at Workshop No. 07 with spun starlight thread.
                  </p>
                </div>

                {onNavigateToDelivery && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onNavigateToDelivery}
                      className="w-full px-5 py-3 rounded-full font-bold text-xs bg-gradient-to-r from-[#B9A5E8] to-[#D995B7] text-[#29213F] shadow hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Dream Delivery Navigator →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
