import React, { useEffect, useRef, useState } from 'react';
import { Route } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { DESTINATIONS, MAP_HOME } from '../data/destinations';
import { LumiCharacter } from './LumiCharacter';

// "Tonight's Route": a scroll-synced delivery map. The section is tall and the map stays pinned
// while you scroll; Lumi flies along one continuous SVG route and each stop lights up as passed.

const ROUTE = 'M 100 340 C 110 250, 150 180, 220 160 C 300 135, 400 90, 480 120 C 560 150, 620 220, 640 310';
const W = 800;
const H = 450;

export const DeliveryRouteScroll: React.FC = () => {
  const { state } = useAtelier();
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const lumiRef = useRef<HTMLDivElement>(null);
  const [stopAt, setStopAt] = useState<number[]>([]); // route fraction where each stop sits
  const [progress, setProgress] = useState(0);

  // Where along the route each destination sits (nearest sampled point).
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const samples = Array.from({ length: 400 }, (_, i) => {
      const p = path.getPointAtLength((i / 399) * total);
      return { f: i / 399, x: p.x, y: p.y };
    });
    setStopAt(
      DESTINATIONS.map((d) => samples.reduce((best, s) => (Math.hypot(s.x - d.x, s.y - d.y) < Math.hypot(best.x - d.x, best.y - d.y) ? s : best)).f)
    );
  }, []);

  // Scroll drives the flight.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const path = pathRef.current;
      if (!section || !path) return;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const f = Math.min(1, Math.max(0, (-rect.top / Math.max(1, travel)) * 1.06));
      const total = path.getTotalLength();
      const p = path.getPointAtLength(f * total);
      const ahead = path.getPointAtLength(Math.min(total, f * total + 4));
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
      trailRef.current?.style.setProperty('stroke-dashoffset', String(1 - f));
      if (lumiRef.current) {
        lumiRef.current.style.left = `${(p.x / W) * 100}%`;
        lumiRef.current.style.top = `${(p.y / H) * 100}%`;
        lumiRef.current.style.transform = `translate(-50%, -62%) rotate(${Math.max(-18, Math.min(18, angle * 0.25))}deg)`;
      }
      setProgress((prev) => (Math.abs(prev - f) > 0.01 || f === 0 || f === 1 ? f : prev));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const reached = stopAt.map((f) => progress >= f - 0.005);
  const current = reached.lastIndexOf(true);
  const caption =
    current >= 0
      ? `${DESTINATIONS[current].name}: ${DESTINATIONS[current].vignette}`
      : 'Scroll to fly the mended dream out of Workshop No. 07 and home to its sleepers.';

  return (
    <section ref={sectionRef} id="delivery-route" aria-labelledby="delivery-route-heading" className="relative h-[240vh] px-4 sm:px-6 lg:px-8">
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 max-w-5xl mx-auto py-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
            <Route className="w-3.5 h-3.5" />
            <span>Tonight's Route · scroll to fly</span>
          </div>
          <h2 id="delivery-route-heading" className="text-2xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
            The Dream Delivery Flight
          </h2>
        </div>

        <div className="relative w-full rounded-3xl overflow-hidden border-2 border-[var(--border-glow)] shadow-2xl bg-[radial-gradient(ellipse_at_50%_20%,#33285a_0%,#1d1730_60%,#140f22_100%)]" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
            {Array.from({ length: 40 }, (_, i) => (
              <circle key={i} cx={(i * 197) % W} cy={(i * 83) % (H - 60)} r={i % 5 === 0 ? 1.6 : 0.9} fill="#fff8f1" opacity={0.35 + (i % 4) * 0.12} />
            ))}
            <path d={`M0 ${H} L0 400 C 120 370, 220 420, 340 395 C 460 370, 560 420, 680 392 C 740 380, 780 400, ${W} 395 L${W} ${H} Z`} fill="#2f2552" />
            <path ref={pathRef} d={ROUTE} fill="none" stroke="#b9a5e8" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.45" />
            <path ref={trailRef} d={ROUTE} pathLength={1} fill="none" stroke="#f4c96b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" style={{ filter: 'drop-shadow(0 0 6px rgba(244,201,107,0.8))' }} />

            {/* Workshop No. 07 */}
            <g transform={`translate(${MAP_HOME.x} ${MAP_HOME.y})`}>
              <circle r="22" fill="#f4c96b" opacity="0.18" />
              <path d="M-16 6 A16 16 0 0 1 16 6 Z" fill="#c99a3a" />
              <rect x="-14" y="6" width="28" height="12" rx="2" fill="#5a4a8a" />
              <text y="34" textAnchor="middle" fontSize="12" fontFamily="Georgia, serif" fill="#f4c96b">No. 07</text>
            </g>

            {DESTINATIONS.map((d, i) => (
              <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
                <circle r={reached[i] ? 20 : 12} fill={reached[i] ? '#f4c96b' : '#b9a5e8'} opacity={reached[i] ? 0.28 : 0.18} style={{ transition: 'all 0.4s' }} />
                <circle r="7" fill={reached[i] ? '#f4c96b' : '#3e3170'} stroke={reached[i] ? '#fff1c2' : '#b9a5e8'} strokeWidth="2" style={{ transition: 'all 0.4s' }} />
                <text y="-18" textAnchor="middle" fontSize="13" fontFamily="Georgia, serif" fill={reached[i] ? '#fff1c2' : '#c9b8f5'}>
                  {reached[i] ? '✓ ' : ''}
                  {d.name.replace('The ', '')}
                </text>
              </g>
            ))}
          </svg>

          <div ref={lumiRef} className="absolute w-10 h-10 sm:w-14 sm:h-14 pointer-events-none will-change-transform" style={{ left: `${(MAP_HOME.x / W) * 100}%`, top: `${(MAP_HOME.y / H) * 100}%` }} aria-hidden="true">
            <LumiCharacter mood={current === DESTINATIONS.length - 1 ? 'celebrating' : 'focused'} size="100%" lanternColor={state.lanternConfig.color} enableEyeTracking={false} />
          </div>
        </div>

        <p className="max-w-2xl text-center text-sm sm:text-base text-[var(--text-secondary)] min-h-[3.5rem]" aria-live="polite">
          {caption}
        </p>
        <div className="w-full max-w-md h-1.5 rounded-full bg-[var(--surface-badge)] overflow-hidden" aria-hidden="true">
          <div className="h-full bg-gradient-to-r from-[#B9A5E8] to-[#F4C96B]" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </section>
  );
};
