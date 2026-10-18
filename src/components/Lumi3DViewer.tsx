import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAtelier } from '../context/AtelierContext';
import { LANTERN_PALETTE } from '../data/lantern';
import { RotateCw, Sparkles, Eye, Info } from 'lucide-react';

interface Lumi3DViewerProps {
  className?: string;
}

/** Returns a friendly message when this browser can't draw WebGL, or null when it can. */
const detectWebGLProblem = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl ? null : 'WebGL is not supported in this environment.';
  } catch {
    return 'WebGL initialization failed.';
  }
};

export const Lumi3DViewer: React.FC<Lumi3DViewerProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { state } = useAtelier();
  const [autoRotate, setAutoRotate] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webGLError] = useState<string | null>(detectWebGLProblem);

  const lanternColor = state.lanternConfig.color;
  const palette = LANTERN_PALETTE[lanternColor] || LANTERN_PALETTE.gold;

  useEffect(() => {
    const container = mountRef.current;
    if (!container || webGLError) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Group for Lumi model
    const lumiGroup = new THREE.Group();
    scene.add(lumiGroup);

    // MATERIALS
    const creamBodyMat = new THREE.MeshStandardMaterial({
      color: 0xfff9f3,
      roughness: 0.6,
      metalness: 0.05,
    });

    const lavenderWingMat = new THREE.MeshPhysicalMaterial({
      color: 0xb9a5e8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.3,
      transmission: 0.4,
      ior: 1.3,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf4c96b,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0xdca334,
      emissiveIntensity: 0.35,
    });

    const roseScarfMat = new THREE.MeshStandardMaterial({
      color: 0xd995b7,
      roughness: 0.8,
      metalness: 0.0,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2,
    });

    const amberEyeMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.1,
      metalness: 0.1,
    });

    // 1. PEAR-SHAPED BODY
    const bodyGeo = new THREE.SphereGeometry(0.55, 32, 32);
    bodyGeo.scale(0.85, 1.1, 0.85);
    const bodyMesh = new THREE.Mesh(bodyGeo, creamBodyMat);
    bodyMesh.position.y = -0.2;
    lumiGroup.add(bodyMesh);

    // 2. HEAD
    const headGeo = new THREE.SphereGeometry(0.48, 32, 32);
    headGeo.scale(1.1, 0.95, 1.0);
    const headMesh = new THREE.Mesh(headGeo, creamBodyMat);
    headMesh.position.y = 0.45;
    lumiGroup.add(headMesh);

    // 3. EYES
    const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, amberEyeMat);
    leftEye.position.set(-0.2, 0.48, 0.42);
    const rightEye = new THREE.Mesh(eyeGeo, amberEyeMat);
    rightEye.position.set(0.2, 0.48, 0.42);
    lumiGroup.add(leftEye, rightEye);

    // Specular eye highlights
    const specMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const specGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const leftSpec = new THREE.Mesh(specGeo, specMat);
    leftSpec.position.set(-0.18, 0.51, 0.5);
    const rightSpec = new THREE.Mesh(specGeo, specMat);
    rightSpec.position.set(0.22, 0.51, 0.5);
    lumiGroup.add(leftSpec, rightSpec);

    // 4. ROSY CHEEKS
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xd995b7, transparent: true, opacity: 0.5 });
    const cheekGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.3, 0.38, 0.4);
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.3, 0.38, 0.4);
    lumiGroup.add(leftCheek, rightCheek);

    // 5. KNITTED SCARF
    const scarfGeo = new THREE.TorusGeometry(0.44, 0.1, 16, 32);
    scarfGeo.rotateX(Math.PI / 2);
    const scarfMesh = new THREE.Mesh(scarfGeo, roseScarfMat);
    scarfMesh.position.y = 0.18;
    lumiGroup.add(scarfMesh);

    // Scarf tail
    const scarfTailGeo = new THREE.BoxGeometry(0.12, 0.4, 0.04);
    const scarfTail = new THREE.Mesh(scarfTailGeo, roseScarfMat);
    scarfTail.position.set(0.18, -0.05, 0.42);
    scarfTail.rotation.z = -0.15;
    lumiGroup.add(scarfTail);

    // 6. ANTENNAE WITH CRESCENT TIPS
    const leftAntennaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.8, 0.1),
      new THREE.Vector3(-0.3, 1.15, 0.15),
      new THREE.Vector3(-0.45, 1.3, 0.1),
    ]);
    const rightAntennaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, 0.8, 0.1),
      new THREE.Vector3(0.3, 1.15, 0.15),
      new THREE.Vector3(0.45, 1.3, 0.1),
    ]);
    const antennaTubeGeoL = new THREE.TubeGeometry(leftAntennaCurve, 16, 0.02, 8, false);
    const antennaTubeGeoR = new THREE.TubeGeometry(rightAntennaCurve, 16, 0.02, 8, false);
    const antL = new THREE.Mesh(antennaTubeGeoL, creamBodyMat);
    const antR = new THREE.Mesh(antennaTubeGeoR, creamBodyMat);
    lumiGroup.add(antL, antR);

    // Crescent tips
    const crescentGeo = new THREE.TorusGeometry(0.08, 0.025, 8, 16, Math.PI * 1.3);
    const crescentL = new THREE.Mesh(crescentGeo, goldAccentMat);
    crescentL.position.set(-0.45, 1.3, 0.1);
    crescentL.rotation.z = Math.PI / 3;
    const crescentR = new THREE.Mesh(crescentGeo, goldAccentMat);
    crescentR.position.set(0.45, 1.3, 0.1);
    crescentR.rotation.z = -Math.PI / 3;
    lumiGroup.add(crescentL, crescentR);

    // 7. WINGS (4 Wings with individual pivot groups for flapping)
    const upperWingGeo = new THREE.ConeGeometry(0.55, 1.2, 16);
    upperWingGeo.scale(0.3, 1, 0.08);

    const lowerWingGeo = new THREE.ConeGeometry(0.35, 0.8, 16);
    lowerWingGeo.scale(0.3, 1, 0.08);

    // Left Upper Wing
    const leftUpperWingPivot = new THREE.Group();
    leftUpperWingPivot.position.set(-0.25, 0.15, -0.2);
    const leftUpperWing = new THREE.Mesh(upperWingGeo, lavenderWingMat);
    leftUpperWing.position.set(-0.45, 0.45, 0);
    leftUpperWing.rotation.z = 0.8;
    leftUpperWingPivot.add(leftUpperWing);
    lumiGroup.add(leftUpperWingPivot);

    // Right Upper Wing
    const rightUpperWingPivot = new THREE.Group();
    rightUpperWingPivot.position.set(0.25, 0.15, -0.2);
    const rightUpperWing = new THREE.Mesh(upperWingGeo, lavenderWingMat);
    rightUpperWing.position.set(0.45, 0.45, 0);
    rightUpperWing.rotation.z = -0.8;
    rightUpperWingPivot.add(rightUpperWing);
    lumiGroup.add(rightUpperWingPivot);

    // Left Lower Wing
    const leftLowerWingPivot = new THREE.Group();
    leftLowerWingPivot.position.set(-0.2, -0.1, -0.2);
    const leftLowerWing = new THREE.Mesh(lowerWingGeo, lavenderWingMat);
    leftLowerWing.position.set(-0.35, -0.25, 0);
    leftLowerWing.rotation.z = 1.2;
    leftLowerWingPivot.add(leftLowerWing);
    lumiGroup.add(leftLowerWingPivot);

    // Right Lower Wing
    const rightLowerWingPivot = new THREE.Group();
    rightLowerWingPivot.position.set(0.2, -0.1, -0.2);
    const rightLowerWing = new THREE.Mesh(lowerWingGeo, lavenderWingMat);
    rightLowerWing.position.set(0.35, -0.25, 0);
    rightLowerWing.rotation.z = -1.2;
    rightLowerWingPivot.add(rightLowerWing);
    lumiGroup.add(rightLowerWingPivot);

    // 8. BRASS STAR LANTERN
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.65, -0.3, 0.25);

    // Cap and base
    const lanternCapGeo = new THREE.ConeGeometry(0.14, 0.1, 16);
    const capMesh = new THREE.Mesh(lanternCapGeo, brassMat);
    capMesh.position.y = 0.22;
    const baseMesh = new THREE.Mesh(lanternCapGeo, brassMat);
    baseMesh.position.y = -0.22;
    baseMesh.rotation.x = Math.PI;

    // Glass cylinder
    const glassColor = new THREE.Color(palette.hex);
    const lanternGlassMat = new THREE.MeshPhysicalMaterial({
      color: glassColor,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      transmission: 0.8,
    });
    const glassGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.35, 16);
    const glassMesh = new THREE.Mesh(glassGeo, lanternGlassMat);

    // Star core inside lantern
    const starCoreGeo = new THREE.OctahedronGeometry(0.06, 0);
    const starCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starCoreMesh = new THREE.Mesh(starCoreGeo, starCoreMat);

    // Real PointLight inside lantern casting light!
    const lanternLight = new THREE.PointLight(glassColor, 2.5, 4);
    lanternLight.position.set(0, 0, 0);

    lanternGroup.add(capMesh, baseMesh, glassMesh, starCoreMesh, lanternLight);
    lumiGroup.add(lanternGroup);

    // SCENE LIGHTS
    const ambientLight = new THREE.AmbientLight(0xfff8f1, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff4cc, 1.6);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xb9a5e8, 1.0);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // Interactive pointer drag orbit
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.006;
      targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation render loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Wing flutter animation
      const flutter = Math.sin(elapsed * 7) * 0.28;
      leftUpperWingPivot.rotation.y = -flutter;
      rightUpperWingPivot.rotation.y = flutter;
      leftLowerWingPivot.rotation.y = -flutter * 0.8;
      rightLowerWingPivot.rotation.y = flutter * 0.8;

      // Gentle floating bob
      lumiGroup.position.y = Math.sin(elapsed * 2.2) * 0.08;

      // Star core sparkle inside lantern
      starCoreMesh.rotation.y = elapsed * 2.5;
      starCoreMesh.rotation.z = elapsed * 1.5;
      lanternLight.intensity = 2.2 + Math.sin(elapsed * 4) * 0.6;

      // Handle auto-rotate or drag
      if (!isDragging && autoRotate) {
        targetRotationY += 0.008;
      }

      lumiGroup.rotation.y += (targetRotationY - lumiGroup.rotation.y) * 0.08;
      lumiGroup.rotation.x += (targetRotationX - lumiGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, [palette, autoRotate, webGLError]);

  if (webGLError) {
    return (
      <div className={`p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] ${className}`}>
        <Info className="w-5 h-5 mx-auto mb-2 text-[var(--accent-gold)]" />
        <p>{webGLError}</p>
        <p className="mt-1">Falling back to 2D handcrafted SVG illustration.</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-80 sm:h-96 rounded-3xl cursor-grab active:cursor-grabbing relative overflow-hidden bg-gradient-to-b from-[#29213F]/50 to-[#191326]/60 border-2 border-[var(--border-glow)] shadow-2xl flex items-center justify-center"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[var(--accent-gold)] gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Summoning 3D Moon Moth...</span>
          </div>
        )}

        {/* Orbit Helper Tip */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5 pointer-events-none">
          <Eye className="w-3 h-3 text-[var(--accent-gold)]" />
          <span>Click & Drag to Rotate 360°</span>
        </div>

        {/* Auto-rotate Toggle */}
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border ${
            autoRotate
              ? 'bg-[#F4C96B]/25 border-[#F4C96B] text-[var(--text-primary)] shadow-sm'
              : 'bg-black/40 border-white/20 text-[var(--text-muted)] hover:text-white'
          }`}
          title="Toggle automatic rotation"
        >
          <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'Auto-Orbit' : 'Manual'}</span>
        </button>
      </div>

      <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2">
        ✦ Lumi in 3D · drag to spin
      </span>
    </div>
  );
};
