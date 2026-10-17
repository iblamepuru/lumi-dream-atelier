import React, { useState } from 'react';
import { DESTINATIONS, MAP_HOME } from '../data/destinations';
import type { DestinationId } from '../types/atelier';
import { useAtelier } from '../context/AtelierContext';
import { HiddenStar } from '../components/HiddenStar';
import { playWhoosh, playSparkle, playChime } from '../utils/soundEngine';
import confetti from 'canvas-confetti';
import { Check, Send, RotateCcw, ArrowRight, Sparkles, Navigation as NavIcon } from 'lucide-react';

export const DreamDeliveryNavigator: React.FC<{ onNavigateToEnding?: () => void }> = ({
  onNavigateToEnding,
}) => {
  const { state, markDeliveryCompleted, resetDeliveries } = useAtelier();
  const [selectedDestId, setSelectedDestId] = useState<DestinationId>('cloud-garden');
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0); // 0 to 1 along route

  const activeDestination = DESTINATIONS.find((d) => d.id === selectedDestId) || DESTINATIONS[0];
  const completedList = state.deliveriesCompleted;
  const isAllDelivered = completedList.length === 3;

  const handleSelectDestination = (destId: DestinationId) => {
    setSelectedDestId(destId);
    playChime(state.isMuted, 523.25);
  };

  const handleDeliver = () => {
    if (isDelivering) return;
    setIsDelivering(true);
    setDeliveryProgress(0);
    playWhoosh(state.isMuted);

    // Animate along path over 1.2s
    const startTime = performance.now();
    const duration = 1200;

    const animateFlight = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setDeliveryProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateFlight);
      } else {
        setIsDelivering(false);
        markDeliveryCompleted(selectedDestId);
        playSparkle(state.isMuted);

        try {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { y: 0.6 },
            colors: ['#F4C96B', '#D995B7', '#B9A5E8', '#93C5FD'],
          });
        } catch {
          // Confetti fallback
        }
      }
    };

    requestAnimationFrame(animateFlight);
  };

  const handleResetMap = () => {
    resetDeliveries();
    setDeliveryProgress(0);
    playChime(state.isMuted, 440);
  };

  // Calculate coordinates along flight curve for Lumi's position during delivery
  const getLumiPosition = () => {
    const t = deliveryProgress;
    // Cubic bezier from Observatory (100, 340) to Destination
    const p0 = { x: 100, y: 340 };
    let p1 = { x: 120, y: 230 };
    let p2 = { x: 160, y: 180 };
    const p3 = { x: activeDestination.x, y: activeDestination.y };

    if (activeDestination.id === 'sleeping-lighthouse') {
      p1 = { x: 220, y: 280 };
      p2 = { x: 360, y: 140 };
    } else if (activeDestination.id === 'moonflower-valley') {
      p1 = { x: 260, y: 410 };
      p2 = { x: 480, y: 380 };
    }

    // Standard cubic bezier formula
    const cx =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x;

    const cy =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y;

    return { x: cx, y: cy };
  };

  const lumiPos = getLumiPosition();

  return (
    <div className="w-full space-y-8">
      {/* Navigator Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] block">
            Invention 03 · Celestial Map
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
            Dream Delivery Navigator
          </h3>
        </div>

        {/* Counter Badge & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-[var(--border-color)] bg-[var(--surface-badge)]">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C96B]" />
            <span>Delivered: {completedList.length}/3 Dreams</span>
          </div>
          <button
            type="button"
            onClick={handleResetMap}
            title="Reset delivery routes"
            aria-label="Reset delivery routes"
            className="p-2 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG CELESTIAL FLIGHT MAP */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[var(--border-color)] bg-[#191326] shadow-2xl">
        
        {/* HIDDEN STAR #5 (star-map): Floating right beside the ornate Compass Rose */}
        <div className="absolute top-6 right-6 z-20">
          <HiddenStar
            starId="star-map"
            label="The Astrolabe Compass Star"
            hint="Glancing near the golden compass rose in the delivery map..."
          />
        </div>

        {/* SVG MAP CANVAS */}
        <svg
          viewBox="0 0 800 450"
          className="w-full h-auto aspect-[16/9] block select-none"
          role="region"
          aria-label="Cloud-top Celestial Navigation Map"
        >
          <defs>
            {/* Soft Fog Gradients */}
            <linearGradient id="mist-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#29213F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#29213F" stopOpacity="0" />
            </linearGradient>

            <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Deep Starry Sky with subtle grid lat/long lines */}
          <rect width="800" height="450" fill="#1A1329" />
          
          {/* Latitude & Longitude story lines */}
          <path d="M 0 150 Q 400 130 800 150" stroke="#362B54" strokeWidth="1" strokeDasharray="3 6" fill="none" />
          <path d="M 0 300 Q 400 280 800 300" stroke="#362B54" strokeWidth="1" strokeDasharray="3 6" fill="none" />
          <path d="M 260 0 Q 240 225 260 450" stroke="#362B54" strokeWidth="1" strokeDasharray="3 6" fill="none" />
          <path d="M 540 0 Q 560 225 540 450" stroke="#362B54" strokeWidth="1" strokeDasharray="3 6" fill="none" />

          {/* Background Fluffy Cloud Silhouettes */}
          <path
            d="M 50 380 Q 150 340 250 390 Q 350 330 450 370 Q 550 320 680 380 Q 750 350 800 400 L 800 450 L 0 450 Z"
            fill="#231936"
            opacity="0.8"
          />
          <path
            d="M 0 410 Q 180 370 380 410 Q 580 360 800 420 L 800 450 L 0 450 Z"
            fill="url(#mist-grad)"
          />

          {/* ORNATE COMPASS ROSE (x: 720, y: 70) */}
          <g id="compass-rose" transform="translate(710, 70)">
            <circle cx="0" cy="0" r="28" stroke="#F4C96B" strokeWidth="1" fill="#29213F" opacity="0.6" strokeDasharray="2 3" />
            <polygon points="0,-25 5,-7 25,0 7,5 0,25 -5,7 -25,0 -7,-5" fill="#F4C96B" opacity="0.85" />
            <polygon points="0,-25 -5,-7 0,0" fill="#FFF8F1" />
            <polygon points="25,0 7,5 0,0" fill="#FFF8F1" />
            <polygon points="0,25 5,7 0,0" fill="#FFF8F1" />
            <polygon points="-25,0 -7,-5 0,0" fill="#FFF8F1" />
            <circle cx="0" cy="0" r="3" fill="#D995B7" />
            <text x="0" y="-30" fill="#F4C96B" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
          </g>

          {/* 3 FLIGHT PATH ROUTES FROM OBSERVATORY */}
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestId === dest.id;
            const isDelivered = completedList.includes(dest.id);

            return (
              <g key={dest.id}>
                {/* Glow under active route */}
                {isSelected && (
                  <path
                    d={dest.pathD}
                    stroke="#F4C96B"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#route-glow)"
                    opacity="0.75"
                  />
                )}
                {/* Route Track */}
                <path
                  d={dest.pathD}
                  stroke={
                    isSelected
                      ? '#F4C96B'
                      : isDelivered
                      ? '#B9A5E8'
                      : 'rgba(185, 165, 232, 0.35)'
                  }
                  strokeWidth={isSelected ? '2.5' : '1.8'}
                  strokeDasharray={isSelected ? '6 4' : '4 6'}
                  strokeLinecap="round"
                  fill="none"
                  className={isSelected ? 'animate-pulse-glow' : ''}
                />
              </g>
            );
          })}

          {/* HOME BASE: OBSERVATORY AT x=100, y=340 */}
          <g
            id="home-observatory"
            transform={`translate(${MAP_HOME.x}, ${MAP_HOME.y})`}
            className="cursor-pointer"
          >
            {/* Observatory Dome Base */}
            <circle cx="0" cy="0" r="26" fill="#29213F" stroke="#D4AF37" strokeWidth="2" />
            <path d="M -18 4 Q 0 -22 18 4 Z" fill="#F4C96B" opacity="0.85" />
            <line x1="0" y1="-18" x2="8" y2="-28" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="8" cy="-28" r="3" fill="#FFF8F1" />
            <text
              x="0"
              y="38"
              fill="#FFF8F1"
              fontSize="11"
              fontFamily="var(--font-serif)"
              fontWeight="bold"
              textAnchor="middle"
            >
              Workshop No. 07
            </text>
          </g>

          {/* DESTINATION MARKERS */}
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestId === dest.id;
            const isDelivered = completedList.includes(dest.id);

            return (
              <g
                key={dest.id}
                transform={`translate(${dest.x}, ${dest.y})`}
                onClick={() => handleSelectDestination(dest.id)}
                className="cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectDestination(dest.id);
                  }
                }}
                aria-label={`Destination ${dest.name}. ${isDelivered ? 'Delivered' : 'Awaiting Dream'}`}
              >
                {/* Outer Selection Aura */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="28"
                    fill="none"
                    stroke="#F4C96B"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Main Marker Node */}
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill={isDelivered ? '#B9A5E8' : isSelected ? '#F4C96B' : '#342A4F'}
                  stroke={isSelected ? '#FFF8F1' : '#D4AF37'}
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-110"
                />

                {/* Icon inside node */}
                {isDelivered ? (
                  <text x="0" y="5" fill="#29213F" fontSize="13" fontWeight="bold" textAnchor="middle">
                    ✓
                  </text>
                ) : (
                  <circle cx="0" cy="0" r="6" fill={isSelected ? '#29213F' : '#F4C96B'} />
                )}

                {/* Destination Label */}
                <text
                  x="0"
                  y="34"
                  fill={isSelected ? '#F4C96B' : '#FFF8F1'}
                  fontSize="12"
                  fontFamily="var(--font-serif)"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-md"
                >
                  {dest.name}
                </text>
              </g>
            );
          })}

          {/* ANIMATED MINIATURE LUMI FLIGHT SPRITE */}
          <g
            transform={`translate(${lumiPos.x}, ${lumiPos.y})`}
            className="pointer-events-none transition-transform"
          >
            {/* Glowing Lantern aura during flight */}
            <circle cx="0" cy="0" r="14" fill="#F4C96B" opacity="0.6" filter="url(#route-glow)" />
            {/* Wings */}
            <ellipse cx="-7" cy="-2" rx="6" ry="9" fill="#B9A5E8" transform="rotate(-20 -7 -2)" />
            <ellipse cx="7" cy="-2" rx="6" ry="9" fill="#B9A5E8" transform="rotate(20 7 -2)" />
            {/* Body */}
            <circle cx="0" cy="0" r="5" fill="#FFF8F1" stroke="#5C4033" strokeWidth="1" />
            <circle cx="0" cy="5" r="2.5" fill="#F4C96B" />
          </g>
        </svg>
      </div>

      {/* ACCESSIBLE DESTINATION LIST & DELIVERY ACTION CARD (Below Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Destination Cards List (Touch-friendly & Accessible) */}
        <div className="lg:col-span-6 space-y-3" role="tablist" aria-label="Available Delivery Destinations">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Select A Sleeping Realm:
          </span>

          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestId === dest.id;
            const isDelivered = completedList.includes(dest.id);

            return (
              <button
                key={dest.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectDestination(dest.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between min-h-[58px] ${
                  isSelected
                    ? 'border-[#F4C96B] bg-[#F4C96B]/15 shadow-md'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-glow)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-serif text-[var(--text-primary)]">
                      {dest.name}
                    </span>
                    {isDelivered && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B9A5E8]/30 text-[var(--text-primary)]">
                        <Check className="w-3 h-3 text-[#B9A5E8]" />
                        <span>Delivered</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)] block mt-0.5">
                    {dest.subtitle} · Sleeper: {dest.dreamer}
                  </span>
                </div>
                <NavIcon className={`w-4 h-4 text-[var(--accent-gold)] transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Destination Story Vignette & Action Button */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
              Delivery Target Details
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
              {activeDestination.name}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {activeDestination.description}
            </p>

            {/* Vignette if delivered */}
            {completedList.includes(activeDestination.id) ? (
              <div className="p-4 rounded-2xl bg-[#B9A5E8]/15 border border-[#B9A5E8]/40 space-y-2">
                <span className="text-xs font-bold text-[var(--accent-lavender)] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#B9A5E8]" />
                  <span>Dream Safely Restored & Slumbering</span>
                </span>
                <p className="text-xs font-serif italic text-[var(--text-primary)] leading-relaxed">
                  "{activeDestination.vignette}"
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                Lumi is waiting at the launchpad with your forged lantern. Guide Lumi through the cloud current to complete the delivery!
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleDeliver}
              disabled={isDelivering || completedList.includes(activeDestination.id)}
              className={`w-full py-4 rounded-full font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                completedList.includes(activeDestination.id)
                  ? 'bg-[var(--surface-badge)] text-[var(--text-muted)] border border-[var(--border-color)] cursor-default'
                  : isDelivering
                  ? 'bg-[#F4C96B]/50 text-[#453026] cursor-wait'
                  : 'bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] hover:scale-102 active:scale-95 shadow-[0_0_20px_rgba(244,201,107,0.4)] cursor-pointer'
              }`}
            >
              {completedList.includes(activeDestination.id) ? (
                <>
                  <Check className="w-4 h-4 text-[#B9A5E8]" />
                  <span>Delivered to {activeDestination.name}</span>
                </>
              ) : isDelivering ? (
                <span>Lumi Flying Along Route... ✦</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Deliver Dream to {activeDestination.name}</span>
                </>
              )}
            </button>

            {/* If all 3 deliveries are complete, invite to Final Goodnight scene */}
            {isAllDelivered && onNavigateToEnding && (
              <button
                type="button"
                onClick={onNavigateToEnding}
                className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#B9A5E8] via-[#D995B7] to-[#F4C96B] text-[#29213F] shadow-xl hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2 animate-bounce cursor-pointer"
              >
                <span>✦ All Deliveries Complete! View Final Goodnight Scene</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
