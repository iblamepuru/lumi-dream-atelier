import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Procedural 3D Lumi: every texture is painted on a canvas and every part is built from
// geometry, so the model stays 100% original with no external art files.

const TAU = Math.PI * 2;

const canvasTexture = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void, srgb = true) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  paint(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

/** Big amber storybook eye, painted on an equirectangular map so the iris faces +Z. */
const eyeTexture = () =>
  canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = '#2a1a2e';
    ctx.fillRect(0, 0, 512, 256);
    const cx = 128; // u = 0.25 faces +Z on a THREE.SphereGeometry
    const cy = 128;
    const iris = ctx.createRadialGradient(cx, cy + 8, 6, cx, cy, 74);
    iris.addColorStop(0, '#fff1c2');
    iris.addColorStop(0.35, '#f4c96b');
    iris.addColorStop(0.75, '#c9862f');
    iris.addColorStop(1, '#5a3420');
    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(cx, cy, 74, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#1b1020';
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 40, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 26, cy - 26, 17, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx + 22, cy + 20, 8, 0, TAU);
    ctx.fill();
  });

/** Soft round glow used for the lantern halo, sparkles and (darkened) the contact shadow. */
export const glowTexture = (inner: string, outer: string) =>
  canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });

/** Chunky knitted stripes for the rose scarf. */
const knitTexture = () => {
  const tex = canvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = '#d995b7';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#f6c1d4';
    ctx.fillRect(0, 48, 128, 32);
    ctx.strokeStyle = 'rgba(120, 50, 85, 0.35)';
    ctx.lineWidth = 3;
    for (let x = 0; x < 128; x += 16) {
      for (let y = 0; y < 128; y += 16) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 8, y + 10);
        ctx.lineTo(x + 16, y);
        ctx.stroke();
      }
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

/** Give a ShapeGeometry 0..1 UVs across its bounding box so a canvas paints the whole wing. */
const normaliseUVs = (geo: THREE.ShapeGeometry) => {
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const w = box.max.x - box.min.x;
  const h = box.max.y - box.min.y;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - box.min.x) / w, (pos.getY(i) - box.min.y) / h);
  }
  uv.needsUpdate = true;
  return box;
};

/** Paint a moth wing: hinge glow, veins, a gold crescent eye-spot and a soft rose rim. */
const wingTexture = (shape: THREE.Shape, box: THREE.Box3, spot: { u: number; v: number; r: number }) =>
  canvasTexture(512, 512, (ctx) => {
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;
    const toCanvas = (p: THREE.Vector2) => [((p.x - box.min.x) / w) * 512, (1 - (p.y - box.min.y) / h) * 512] as const;
    const outline = shape.getPoints(80).map(toCanvas);
    const [hx, hy] = toCanvas(new THREE.Vector2(0, 0));

    ctx.beginPath();
    outline.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.save();
    ctx.clip();

    const base = ctx.createRadialGradient(hx, hy, 10, hx, hy, 560);
    base.addColorStop(0, '#f3ecff');
    base.addColorStop(0.22, '#cdbcfb');
    base.addColorStop(0.6, '#9d86e0');
    base.addColorStop(1, '#6b52b8');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    // Veins fanning out from the hinge
    ctx.strokeStyle = 'rgba(255, 248, 241, 0.45)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const a = -1.35 + i * 0.42;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + Math.cos(a) * 220, hy + Math.sin(a) * 120, hx + Math.cos(a) * 600, hy + Math.sin(a) * 600);
      ctx.stroke();
    }

    // Gold crescent eye-spot (a nod to Lumi's crescent markings)
    const sx = spot.u * 512;
    const sy = (1 - spot.v) * 512;
    const ring = ctx.createRadialGradient(sx, sy, spot.r * 0.2, sx, sy, spot.r);
    ring.addColorStop(0, '#fff6d6');
    ring.addColorStop(0.5, '#f4c96b');
    ring.addColorStop(0.82, '#e0a53c');
    ring.addColorStop(1, 'rgba(224, 165, 60, 0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(sx, sy, spot.r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#4b3486';
    ctx.beginPath();
    ctx.arc(sx + spot.r * 0.18, sy - spot.r * 0.05, spot.r * 0.42, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Soft rose rim
    ctx.beginPath();
    outline.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(244, 201, 107, 0.95)';
    ctx.lineWidth = 7;
    ctx.stroke();
  });

const foreWingShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.25, 0.55, 0.9, 0.98, 1.28, 0.86);
  s.bezierCurveTo(1.5, 0.76, 1.4, 0.34, 1.12, 0.14);
  s.bezierCurveTo(0.82, -0.06, 0.36, -0.1, 0, 0);
  return s;
};

const hindWingShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.45, 0.06, 0.95, -0.1, 1.0, -0.42);
  s.bezierCurveTo(1.02, -0.66, 0.82, -0.8, 0.64, -0.86);
  s.bezierCurveTo(0.62, -1.1, 0.76, -1.38, 0.72, -1.55); // luna-moth tail
  s.bezierCurveTo(0.56, -1.46, 0.44, -1.12, 0.42, -0.86);
  s.bezierCurveTo(0.22, -0.7, 0.03, -0.36, 0, 0);
  return s;
};

/** A capsule stretched between two points (arms, scarf strap...). */
const limbBetween = (a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) => {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(0.001, len - radius * 2), 6, 12), material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
};

export interface LumiRig {
  root: THREE.Group;
  wings: { foreL: THREE.Group; foreR: THREE.Group; hindL: THREE.Group; hindR: THREE.Group };
  eyes: [THREE.Mesh, THREE.Mesh];
  antennae: [THREE.Group, THREE.Group];
  lanternPivot: THREE.Group;
  lanternCore: THREE.Mesh;
  lanternLight: THREE.PointLight;
  lanternHalo: THREE.Sprite;
  body: THREE.Group;
}

export function buildLumi(lanternHex: string): LumiRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // ---------- Materials ----------
  const fuzz = new THREE.MeshPhysicalMaterial({
    color: 0xfff4ea,
    roughness: 0.92,
    sheen: 1,
    sheenColor: new THREE.Color(0xe6d8ff),
    sheenRoughness: 0.55,
  });
  const fuzzShade = fuzz.clone();
  fuzzShade.color = new THREE.Color(0xf0dfcf);
  const gold = new THREE.MeshStandardMaterial({ color: 0xf4c96b, metalness: 0.75, roughness: 0.28, emissive: 0x7a5410, emissiveIntensity: 0.35 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a046, metalness: 0.9, roughness: 0.22 });
  const knit = knitTexture();
  const scarfMat = new THREE.MeshPhysicalMaterial({ map: knit, roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color(0xffd6e8) });
  const leather = new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: 0.65 });
  const leatherDark = new THREE.MeshStandardMaterial({ color: 0x6b4430, roughness: 0.7 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x3b2a3f, roughness: 0.6 });

  // ---------- Body: a fuzzy pear-shaped abdomen with soft segment rings ----------
  const profile = new THREE.SplineCurve([
    new THREE.Vector2(0.001, -0.82),
    new THREE.Vector2(0.2, -0.77),
    new THREE.Vector2(0.36, -0.6),
    new THREE.Vector2(0.44, -0.36),
    new THREE.Vector2(0.43, -0.12),
    new THREE.Vector2(0.36, 0.06),
    new THREE.Vector2(0.24, 0.18),
    new THREE.Vector2(0.001, 0.22),
  ]).getPoints(48);
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), fuzz);
  body.add(torso);
  for (const [y, r] of [
    [-0.6, 0.36],
    [-0.4, 0.44],
    [-0.2, 0.435],
  ] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 8, 48), fuzzShade);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    body.add(ring);
  }

  // Fluffy collar ruff
  const tuftGeo = new THREE.SphereGeometry(0.1, 16, 12);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const tuft = new THREE.Mesh(tuftGeo, fuzz);
    tuft.position.set(Math.cos(a) * 0.29, 0.24 + Math.sin(a * 3) * 0.015, Math.sin(a) * 0.29);
    tuft.scale.set(1, 0.75, 1);
    body.add(tuft);
  }

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), fuzz);
  head.position.y = 0.62;
  head.scale.set(1.06, 0.95, 1);
  body.add(head);

  // Eyes: big glossy amber storybook eyes
  const eyeMat = new THREE.MeshPhysicalMaterial({ map: eyeTexture(), roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 });
  const eyeGeo = new THREE.SphereGeometry(0.135, 48, 32);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.17, 0.68, 0.3);
  eyeR.position.set(0.17, 0.68, 0.3);
  body.add(eyeL, eyeR);

  // Cheeks and smile
  const blush = new THREE.MeshBasicMaterial({ color: 0xf2a2bc, transparent: true, opacity: 0.55, depthWrite: false });
  for (const x of [-0.29, 0.29]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), blush);
    cheek.position.set(x, 0.55, 0.3);
    cheek.scale.set(1, 0.55, 0.35);
    body.add(cheek);
  }
  const smileCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.06, 0.52, 0.392), new THREE.Vector3(0, 0.475, 0.41), new THREE.Vector3(0.06, 0.52, 0.392));
  body.add(new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 16, 0.011, 6), ink));

  // Feathery moth antennae with gold crescent tips
  const barbGeo = new THREE.CylinderGeometry(0.004, 0.009, 1, 5);
  barbGeo.translate(0, 0.5, 0);
  const antennae: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const group = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.11, 0.98, 0.1),
      new THREE.Vector3(side * 0.2, 1.24, 0.13),
      new THREE.Vector3(side * 0.4, 1.44, 0.06),
      new THREE.Vector3(side * 0.56, 1.5, -0.02),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.016, 8), gold));
    const count = 16;
    const barbs = new THREE.InstancedMesh(barbGeo, fuzzShade, count * 2);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const t = 0.12 + (i / (count - 1)) * 0.8;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const length = 0.06 + Math.sin(t * Math.PI) * 0.09;
      for (const s of [-1, 1]) {
        const dir = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 0, 1)).multiplyScalar(s).add(new THREE.Vector3(0, 0, 0.35)).normalize();
        q.setFromUnitVectors(up, dir);
        m.compose(p, q, new THREE.Vector3(1, length, 1));
        barbs.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), m);
      }
    }
    group.add(barbs);
    const tip = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 10, 24, Math.PI * 1.35), gold);
    tip.position.copy(curve.getPointAt(1));
    tip.rotation.set(0, 0, side > 0 ? -Math.PI / 4 : Math.PI * 1.15);
    group.add(tip);
    group.userData.side = side;
    body.add(group);
    antennae.push(group);
  }

  // Knitted rose scarf with a fringed tail
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.085, 16, 48), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 0.2;
  knit.repeat.set(6, 1);
  body.add(scarf);
  const tailGeo = new THREE.BoxGeometry(0.15, 0.42, 0.05, 1, 6, 1);
  const tail = new THREE.Mesh(tailGeo, scarfMat);
  tail.position.set(0.16, -0.02, 0.36);
  tail.rotation.set(0.25, 0, -0.18);
  body.add(tail);
  for (let i = 0; i < 4; i++) {
    const fringe = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 5), scarfMat);
    fringe.position.set(0.2 - i * 0.037, -0.25, 0.42);
    fringe.rotation.z = -0.18;
    body.add(fringe);
  }

  // Dream-fragment satchel with a glowing shard peeking out
  const satchel = new THREE.Group();
  satchel.position.set(-0.36, -0.28, 0.2);
  satchel.rotation.set(0.1, 0.5, 0.12);
  satchel.add(new THREE.Mesh(new RoundedBoxGeometry(0.27, 0.21, 0.11, 4, 0.04), leather));
  const flap = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.11, 0.12, 4, 0.035), leatherDark);
  flap.position.set(0, 0.06, 0.004);
  satchel.add(flap);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), gold);
  button.position.set(0, 0.02, 0.06);
  satchel.add(button);
  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.05),
    new THREE.MeshStandardMaterial({ color: 0xd995b7, emissive: 0xd995b7, emissiveIntensity: 1.4, roughness: 0.2 })
  );
  shard.position.set(0.06, 0.15, 0);
  shard.scale.set(0.7, 1.3, 0.7);
  satchel.add(shard);
  body.add(satchel);
  body.add(limbBetween(new THREE.Vector3(0.2, 0.3, 0.18), new THREE.Vector3(-0.36, -0.18, 0.24), 0.014, leatherDark));

  // Little arms and feet
  body.add(limbBetween(new THREE.Vector3(-0.3, 0.08, 0.18), new THREE.Vector3(-0.38, -0.14, 0.26), 0.05, fuzz));
  const hand = new THREE.Vector3(0.5, 0.0, 0.3);
  body.add(limbBetween(new THREE.Vector3(0.3, 0.1, 0.16), hand, 0.05, fuzz));
  for (const x of [-0.13, 0.13]) {
    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.06, 6, 12), fuzzShade);
    foot.position.set(x, -0.84, 0.08);
    foot.rotation.x = Math.PI / 2;
    body.add(foot);
  }

  // ---------- Brass star lantern, hanging from Lumi's hand ----------
  const glow = new THREE.Color(lanternHex);
  const lanternPivot = new THREE.Group();
  lanternPivot.position.copy(hand);
  const lantern = new THREE.Group();
  lantern.position.y = -0.3;
  lanternPivot.add(lantern);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24, Math.PI), brass);
  handle.position.y = 0.24;
  lantern.add(handle);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.1, 6), brass);
  cap.position.y = 0.2;
  lantern.add(cap);
  const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.05, 6), brass);
  baseRing.position.y = -0.17;
  lantern.add(baseRing);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 5), brass);
    bar.position.set(Math.cos(a) * 0.105, 0.0, Math.sin(a) * 0.105);
    lantern.add(bar);
  }
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.32, 6),
    new THREE.MeshPhysicalMaterial({ color: glow, transmission: 0.85, thickness: 0.1, roughness: 0.06, transparent: true, opacity: 0.55, emissive: glow, emissiveIntensity: 0.25 })
  );
  lantern.add(glass);
  const lanternCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.055),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: glow, emissiveIntensity: 3 })
  );
  lantern.add(lanternCore);
  const lanternHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)'), color: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
  );
  lanternHalo.scale.set(0.9, 0.9, 1);
  lantern.add(lanternHalo);
  const lanternLight = new THREE.PointLight(glow, 3, 4, 1.6);
  lantern.add(lanternLight);
  body.add(lanternPivot);

  // ---------- Wings: painted moth wings on hinged pivots ----------
  const makeWing = (shape: THREE.Shape, spot: { u: number; v: number; r: number }) => {
    const geo = new THREE.ShapeGeometry(shape, 48);
    const box = normaliseUVs(geo);
    const mat = new THREE.MeshPhysicalMaterial({
      map: wingTexture(shape, box, spot),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.96,
      roughness: 0.42,
      sheen: 0.45,
      sheenColor: new THREE.Color(0xe2d6ff),
      iridescence: 0.35,
      iridescenceIOR: 1.3,
    });
    return { geo, mat };
  };
  const fore = makeWing(foreWingShape(), { u: 0.66, v: 0.56, r: 64 });
  const hind = makeWing(hindWingShape(), { u: 0.66, v: 0.62, r: 44 });

  const wingPivot = (side: number, isFore: boolean) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.12, isFore ? 0.24 : 0.04, -0.14);
    const { geo, mat } = isFore ? fore : hind;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(side * 0.82, 0.82, 0.82);
    mesh.rotation.z = side * (isFore ? 0.12 : -0.06);
    pivot.add(mesh);
    body.add(pivot);
    return pivot;
  };

  return {
    root,
    body,
    wings: { foreL: wingPivot(-1, true), foreR: wingPivot(1, true), hindL: wingPivot(-1, false), hindR: wingPivot(1, false) },
    eyes: [eyeL, eyeR],
    antennae: [antennae[0], antennae[1]],
    lanternPivot,
    lanternCore,
    lanternLight,
    lanternHalo,
  };
}

/** Free every geometry, material and texture under an object. */
export function disposeTree(object: THREE.Object3D) {
  object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}
