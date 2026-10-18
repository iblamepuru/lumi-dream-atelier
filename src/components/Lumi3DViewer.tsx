import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useAtelier } from '../context/AtelierContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { LANTERN_PALETTE } from '../data/lantern';
import { buildLumi, disposeTree, glowTexture } from './lumi3d/buildLumi';
import { RotateCw, Sparkles, Eye, Info } from 'lucide-react';

interface Lumi3DViewerProps {
  className?: string;
}

/** Returns a friendly message when this browser can't draw WebGL, or null when it can. */
const detectWebGLProblem = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return gl ? null : 'WebGL is not supported in this environment.';
  } catch {
    return 'WebGL initialization failed.';
  }
};

export const Lumi3DViewer: React.FC<Lumi3DViewerProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { state } = useAtelier();
  const reducedMotion = useReducedMotion();
  const [autoRotate, setAutoRotate] = useState(!reducedMotion);
  const autoRotateRef = useRef(autoRotate);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webGLError] = useState<string | null>(detectWebGLProblem);

  const lanternHex = (LANTERN_PALETTE[state.lanternConfig.color] || LANTERN_PALETTE.gold).hex;

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || webGLError) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // ---------- Renderer, camera, studio lighting ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    // Shader checks are for development; in production they only add noisy driver warnings.
    renderer.debug.checkShaderErrors = import.meta.env.DEV;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 5.6);
    camera.lookAt(0, 0.36, 0);

    scene.add(new THREE.HemisphereLight(0xd8ccff, 0x2a2140, 1.1));
    const key = new THREE.DirectionalLight(0xfff0d6, 2.2);
    key.position.set(2.5, 3.5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb9a5e8, 2.6);
    rim.position.set(-3, 2, -3.5);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xf6c1d4, 0.6);
    fill.position.set(-3, -1, 3);
    scene.add(fill);

    // ---------- Lumi ----------
    const lumi = buildLumi(lanternHex);
    scene.add(lumi.root);

    // Soft cloud shadow under Lumi
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({ map: glowTexture('rgba(10,6,24,0.55)', 'rgba(10,6,24,0)'), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.02;
    scene.add(shadow);

    // Drifting sparkles
    const sparkleCount = 70;
    const positions = new Float32Array(sparkleCount * 3);
    const colors = new Float32Array(sparkleCount * 3);
    const palette = [new THREE.Color(0xf4c96b), new THREE.Color(0xb9a5e8), new THREE.Color(0xfff8f1), new THREE.Color(0xd995b7)];
    for (let i = 0; i < sparkleCount; i++) {
      const r = 1.3 + Math.random() * 1.1;
      const a = Math.random() * Math.PI * 2;
      positions.set([Math.cos(a) * r, -0.9 + Math.random() * 2.8, Math.sin(a) * r * 0.7 - 0.4], i * 3);
      const c = palette[i % palette.length];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.075,
      map: glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // ---------- Interaction: drag to orbit, eyes follow the pointer ----------
    let isDragging = false;
    let last = { x: 0, y: 0 };
    let targetYaw = 0.35;
    let targetPitch = 0;
    const look = { x: 0, y: 0 };
    const lookTarget = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      last = { x: e.clientX, y: e.clientY };
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      lookTarget.x = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.6)));
      lookTarget.y = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height * 0.35)) / (rect.height * 0.6)));
      if (!isDragging) return;
      targetYaw += (e.clientX - last.x) * 0.009;
      targetPitch = Math.max(-0.35, Math.min(0.35, targetPitch + (e.clientY - last.y) * 0.005));
      last = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      isDragging = false;
    };
    const domEl = renderer.domElement;
    domEl.style.touchAction = 'none';
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    // ---------- Animation loop (paused when off-screen or hidden) ----------
    const startedAt = performance.now();
    let animId = 0;
    let visible = true;
    let nextBlink = 2.5;
    const motion = reducedMotion ? 0.25 : 1;

    const frame = () => {
      animId = 0;
      const t = (performance.now() - startedAt) / 1000;

      // Wings: a soft moth flap, hindwings trailing a little behind
      const flap = Math.sin(t * 3.4) * 0.42 * motion;
      const lag = Math.sin(t * 3.4 - 0.5) * 0.36 * motion;
      lumi.wings.foreR.rotation.y = -0.25 - flap;
      lumi.wings.foreL.rotation.y = 0.25 + flap;
      lumi.wings.hindR.rotation.y = -0.2 - lag;
      lumi.wings.hindL.rotation.y = 0.2 + lag;

      // Float, breathe, sway
      lumi.root.position.y = Math.sin(t * 1.8) * 0.07 * motion;
      lumi.body.scale.setScalar(1 + Math.sin(t * 2.4) * 0.008 * motion);
      for (const ant of lumi.antennae) ant.rotation.z = Math.sin(t * 2 + ant.userData.side) * 0.04 * motion;
      lumi.lanternPivot.rotation.z = Math.sin(t * 1.6) * 0.14 * motion;
      lumi.lanternCore.rotation.y = t * 1.8;
      const flicker = 1 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 3.1) * 0.06;
      lumi.lanternLight.intensity = 3 * flicker;
      lumi.lanternHalo.scale.setScalar(0.85 * flicker);
      sparkles.rotation.y = t * 0.05;
      sparkleMat.opacity = 0.75 + Math.sin(t * 2.2) * 0.2;

      // Eyes follow the pointer, with a blink every few seconds
      look.x += (lookTarget.x - look.x) * 0.12;
      look.y += (lookTarget.y - look.y) * 0.12;
      let lid = 1;
      if (t > nextBlink) {
        const k = (t - nextBlink) / 0.16;
        lid = k < 1 ? Math.abs(1 - 2 * k) * 0.95 + 0.05 : 1;
        if (k >= 1) nextBlink = t + 2.8 + Math.random() * 2.6;
      }
      for (const eye of lumi.eyes) {
        eye.rotation.y = look.x * 0.45;
        eye.rotation.x = look.y * 0.35;
        eye.scale.y = lid;
      }

      // Orbit
      if (!isDragging && autoRotateRef.current) targetYaw += 0.006 * motion;
      lumi.root.rotation.y += (targetYaw - lumi.root.rotation.y) * 0.08;
      lumi.root.rotation.x += (targetPitch - lumi.root.rotation.x) * 0.08;

      renderer.render(scene, camera);
      if (visible && !document.hidden) animId = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!animId && visible && !document.hidden) animId = requestAnimationFrame(frame);
    };
    start();
    setIsLoaded(true);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(container);
    const onVisibility = () => start();
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      disposeTree(scene);
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, [lanternHex, webGLError, reducedMotion]);

  if (webGLError) {
    return (
      <div className={`p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] ${className}`}>
        <Info className="w-5 h-5 mx-auto mb-2 text-[var(--accent-gold)]" />
        <p>{webGLError}</p>
        <p className="mt-1">Lumi is still here in the 2D storybook view.</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <div
        ref={mountRef}
        className="w-full h-80 sm:h-96 rounded-3xl cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#3d2f63_0%,#241a3a_55%,#150f24_100%)] border-2 border-[var(--border-glow)] shadow-2xl flex items-center justify-center"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[var(--accent-gold)] gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Summoning the 3D moon moth…</span>
          </div>
        )}

        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#FFF8F1]/80 flex items-center gap-1.5 pointer-events-none">
          <Eye className="w-3 h-3 text-[var(--accent-gold)]" />
          <span>Drag to spin · Lumi watches you</span>
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          aria-pressed={autoRotate}
          className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border ${
            autoRotate ? 'bg-[#F4C96B]/25 border-[#F4C96B] text-[#FFF8F1] shadow-sm' : 'bg-black/40 border-white/20 text-[#FFF8F1]/70 hover:text-white'
          }`}
          title="Toggle automatic rotation"
        >
          <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'Auto-Orbit' : 'Manual'}</span>
        </button>
      </div>

      <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2">✦ Lumi in 3D · drag to spin</span>
    </div>
  );
};
