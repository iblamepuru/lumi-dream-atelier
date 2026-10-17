import React, { useState } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { playSnap, playChime, playSparkle, playGentleNudge } from '../utils/soundEngine';
import confetti from 'canvas-confetti';
import { Check, RotateCcw, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface Shard {
  id: 'crown' | 'left-wing' | 'right-wing' | 'core';
  name: string;
  emotion: string;
  color: string;
  points: string; // Polygon points in the 300x300 crystal SVG
  trayPoints: string; // Polygon points in tray view (100x100)
  seamPath: string; // SVG path for glowing moonlight thread
}

const SHARDS: Shard[] = [
  {
    id: 'crown',
    name: 'Crown Shard',
    emotion: 'Hope',
    color: '#F4C96B',
    points: '150,40 230,120 150,150 70,120',
    trayPoints: '50,12 88,45 50,72 12,45',
    seamPath: 'M 70 120 L 150 40 L 230 120 L 150 150 Z',
  },
  {
    id: 'left-wing',
    name: 'Left Wing Shard',
    emotion: 'Memory',
    color: '#B9A5E8',
    points: '70,120 150,150 70,180',
    trayPoints: '15,20 85,50 15,80',
    seamPath: 'M 70 120 L 150 150 L 70 180 Z',
  },
  {
    id: 'right-wing',
    name: 'Right Wing Shard',
    emotion: 'Wonder',
    color: '#93C5FD',
    points: '150,150 230,120 230,180',
    trayPoints: '15,50 85,20 85,80',
    seamPath: 'M 150 150 L 230 120 L 230 180 Z',
  },
  {
    id: 'core',
    name: 'Core Heart Shard',
    emotion: 'Courage',
    color: '#D995B7',
    points: '70,180 150,150 230,180 150,260',
    trayPoints: '18,30 50,10 82,30 50,88',
    seamPath: 'M 70 180 L 150 150 L 230 180 L 150 260 Z',
  },
];

export const DreamRepairLab: React.FC<{ onNavigateToStudio?: () => void }> = ({
  onNavigateToStudio,
}) => {
  const { state, setCrystalRepaired, resetPuzzle, lumiSay } = useAtelier();
  const [selectedShardId, setSelectedShardId] = useState<string | null>(null);
  const [placedShards, setPlacedShards] = useState<string[]>(() => {
    return state.crystalRepaired ? ['crown', 'left-wing', 'right-wing', 'core'] : [];
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    'Select a dream shard from the velvet tray, then place it into its matching crystal frame.'
  );
  const [shakeTarget, setShakeTarget] = useState<string | null>(null);

  const isComplete = placedShards.length === 4;

  const handleSelectTrayShard = (shardId: string) => {
    if (placedShards.includes(shardId)) return;
    setSelectedShardId(shardId);
    playChime(state.isMuted, 523.25);
    const shard = SHARDS.find((s) => s.id === shardId);
    setFeedbackMessage(`Selected ${shard?.name} (${shard?.emotion}). Now click its matching slot on the velvet repair mat.`);
    lumiSay?.(`Hold the ${shard?.name} gently! It holds the power of ${shard?.emotion}.`, 'focused');
  };

  const handlePlaceShard = (targetSlotId: string) => {
    if (!selectedShardId) {
      setFeedbackMessage('Please select a fragment from the tray first!');
      return;
    }

    if (placedShards.includes(targetSlotId)) {
      return;
    }

    if (selectedShardId === targetSlotId) {
      // Correct placement!
      const nextPlaced = [...placedShards, targetSlotId];
      setPlacedShards(nextPlaced);
      setSelectedShardId(null);
      playSnap(state.isMuted);

      const shard = SHARDS.find((s) => s.id === targetSlotId);
      setFeedbackMessage(`Splendid! The ${shard?.name} snapped in place with moonlight thread.`);
      lumiSay?.(`A seamless mend! The starlight thread hums with ${shard?.emotion}.`, 'happy');

      if (nextPlaced.length === 4) {
        setCrystalRepaired(true);
        lumiSay?.("Look how brightly it hums! Now let's house this crystal inside a lantern.", 'celebrating');
        setTimeout(() => {
          playSparkle(state.isMuted);
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#F4C96B', '#D995B7', '#B9A5E8', '#FFF8F1'],
            });
          } catch {
            // Confetti fallback
          }
        }, 150);
      }
    } else {
      // Incorrect placement!
      playGentleNudge(state.isMuted);
      setShakeTarget(targetSlotId);
      setFeedbackMessage("Hmm, that facet angle doesn't quite fit there—try matching the facet shape!");
      lumiSay?.("Hmm, that facet edge doesn't quite align—try matching the facet angles!", 'curious');
      setTimeout(() => setShakeTarget(null), 500);
    }
  };

  const handleReset = () => {
    setPlacedShards([]);
    setSelectedShardId(null);
    resetPuzzle();
    playChime(state.isMuted, 440);
    setFeedbackMessage('Workbench cleared. Select a shard to begin anew.');
  };

  return (
    <div className="w-full space-y-8">
      {/* Workbench Header & Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] block">
            Invention 01 · Restoration Workbench
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
            Dream Crystal Repair Lab
          </h3>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-[var(--border-color)] bg-[var(--surface-badge)]">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C96B]" />
            <span>Mended: {placedShards.length}/4 Facets</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            title="Reset puzzle pieces"
            aria-label="Restart Crystal Puzzle"
            className="p-2 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Helper & Status Announcement (Accessible aria-live) */}
      <div
        role="status"
        aria-live="polite"
        className="p-3.5 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4 text-[var(--accent-gold)] flex-shrink-0" />
        <span className="font-medium text-[var(--text-primary)]">{feedbackMessage}</span>
      </div>

      {/* MAIN PUZZLE INTERACTION STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT: Central Velvet Repair Mat & SVG Crystal Frame */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[var(--bg-primary)] border-2 border-[var(--border-color)] shadow-inner relative overflow-hidden">
          
          {/* Decorative Velvet Mat Fabric Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F4C96B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Glowing Aura when complete */}
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4C96B]/20 via-[#D995B7]/20 to-[#B9A5E8]/20 blur-2xl animate-pulse-glow pointer-events-none" />
          )}

          {/* SVG REPAIR CRYSTAL MAT */}
          <svg
            viewBox="0 0 300 300"
            className="w-64 h-64 sm:w-80 sm:h-80 relative z-10 drop-shadow-xl"
            role="region"
            aria-label="Dream Crystal Assembly Mat"
          >
            <defs>
              {/* Radiance Gradient for complete crystal */}
              <linearGradient id="crystal-radiance" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8F1" />
                <stop offset="30%" stopColor="#F4C96B" />
                <stop offset="70%" stopColor="#D995B7" />
                <stop offset="100%" stopColor="#B9A5E8" />
              </linearGradient>

              {/* Shard Seam Moonlight Glow Filter */}
              <filter id="seam-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Muted Blueprint Outline (Velvet mat placeholder) */}
            <polygon
              points="150,40 230,120 230,180 150,260 70,180 70,120"
              fill="#201736"
              stroke="var(--border-color)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* INTERACTIVE PUZZLE SLOTS */}
            {SHARDS.map((shard) => {
              const isPlaced = placedShards.includes(shard.id);
              const isShaking = shakeTarget === shard.id;

              return (
                <g
                  key={shard.id}
                  onClick={() => handlePlaceShard(shard.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    isShaking ? 'animate-shake' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePlaceShard(shard.id);
                    }
                  }}
                  aria-label={`Target slot for ${shard.name} (${shard.emotion}). ${
                    isPlaced ? 'Occupied' : 'Empty. Click to place selected shard'
                  }`}
                >
                  {/* Slot Target Polygon */}
                  <polygon
                    points={shard.points}
                    fill={
                      isPlaced
                        ? isComplete
                          ? 'url(#crystal-radiance)'
                          : shard.color
                        : selectedShardId === shard.id
                        ? 'rgba(244, 201, 107, 0.25)'
                        : 'rgba(68, 54, 92, 0.5)'
                    }
                    stroke={
                      isPlaced
                        ? '#FFF8F1'
                        : selectedShardId === shard.id
                        ? '#F4C96B'
                        : 'rgba(185, 165, 232, 0.4)'
                    }
                    strokeWidth={isPlaced ? '2' : '1.5'}
                    className={`transition-colors duration-300 ${
                      !isPlaced ? 'hover:fill-rgba(244,201,107,0.2)' : ''
                    }`}
                  />

                  {/* Golden Moonlight Thread Seam (animated on correct placement) */}
                  {isPlaced && (
                    <path
                      d={shard.seamPath}
                      stroke="#F4C96B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      filter="url(#seam-glow)"
                      className="animate-pulse-glow"
                    />
                  )}

                  {/* Slot Label Text inside empty facet */}
                  {!isPlaced && (
                    <text
                      x={
                        shard.id === 'crown'
                          ? 150
                          : shard.id === 'left-wing'
                          ? 98
                          : shard.id === 'right-wing'
                          ? 202
                          : 150
                      }
                      y={
                        shard.id === 'crown'
                          ? 105
                          : shard.id === 'left-wing'
                          ? 152
                          : shard.id === 'right-wing'
                          ? 152
                          : 205
                      }
                      fill="var(--text-muted)"
                      fontSize="10"
                      fontFamily="var(--font-sans)"
                      fontWeight="bold"
                      textAnchor="middle"
                      opacity="0.8"
                    >
                      {shard.emotion}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT: Velvet Shard Tray & Completion Action Card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Shard Tray Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Velvet Shard Tray (Click to Pick Up)
            </span>

            <div className="grid grid-cols-2 gap-3">
              {SHARDS.map((shard) => {
                const isPlaced = placedShards.includes(shard.id);
                const isSelected = selectedShardId === shard.id;

                return (
                  <button
                    key={shard.id}
                    type="button"
                    onClick={() => handleSelectTrayShard(shard.id)}
                    disabled={isPlaced}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center min-h-[90px] ${
                      isPlaced
                        ? 'opacity-40 border-[var(--border-color)] bg-[var(--bg-primary)] cursor-not-allowed'
                        : isSelected
                        ? 'border-[#F4C96B] bg-[#F4C96B]/20 scale-105 shadow-md'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-glow)] hover:scale-102 active:scale-95'
                    }`}
                  >
                    <svg viewBox="0 0 100 100" className="w-10 h-10 mb-1">
                      <polygon
                        points={shard.trayPoints}
                        fill={shard.color}
                        stroke="#FFF8F1"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {shard.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-serif italic">
                      {isPlaced ? 'Restored ✓' : shard.emotion}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPLETION MESSAGE & CALL TO ACTION */}
          {isComplete && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#F4C96B]/20 via-[#D995B7]/20 to-[#B9A5E8]/20 border-2 border-[#F4C96B] shadow-xl space-y-4 animate-float-gentle">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                <Check className="w-4 h-4 text-[#F4C96B]" />
                <span>Crystal Restored to Full Radiance!</span>
              </div>

              {/* Exact Lumi completion quote */}
              <p className="text-sm sm:text-base font-serif italic font-semibold text-[var(--text-primary)] leading-relaxed">
                "Look how brightly it hums! Now let's house this crystal inside a lantern."
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {onNavigateToStudio && (
                  <button
                    type="button"
                    onClick={onNavigateToStudio}
                    className="flex-1 px-5 py-3 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Lantern Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-full font-semibold text-xs border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Restart Puzzle
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
