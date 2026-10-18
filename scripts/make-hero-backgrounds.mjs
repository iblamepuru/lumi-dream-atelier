// Generates the hero backdrops (public/images/hero-night.svg and hero-dawn.svg).
// Original artwork for LUMI: a starry sky over Workshop No. 07, Lumi's observatory on a cloud.
// Run with: node scripts/make-hero-backgrounds.mjs
import fs from 'node:fs';

const W = 1600;
const H = 900;

// Small seeded PRNG so the star field is identical on every build
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const cloudRow = (y, bump, count, seed) => {
  const r = rng(seed);
  let d = `M0 ${H} L0 ${y}`;
  const step = W / count;
  for (let i = 0; i < count; i++) {
    const x1 = i * step;
    const h = bump * (0.6 + r() * 0.8);
    d += ` C${(x1 + step * 0.15).toFixed(0)} ${(y - h).toFixed(0)}, ${(x1 + step * 0.85).toFixed(0)} ${(y - h).toFixed(0)}, ${(x1 + step).toFixed(0)} ${y}`;
  }
  return `${d} L${W} ${H} Z`;
};

function scene(p) {
  const r = rng(p.seed);
  let stars = '';
  for (let i = 0; i < p.starCount; i++) {
    const x = (r() * W).toFixed(0);
    const y = (r() * H * 0.72).toFixed(0);
    const size = (0.5 + r() * 1.4).toFixed(2);
    const color = p.starColors[Math.floor(r() * p.starColors.length)];
    const op = (0.35 + r() * 0.65).toFixed(2);
    stars += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${op}"/>`;
  }
  let sparkles = '';
  for (const [x, y, s] of [
    [180, 140, 9], [430, 70, 6], [905, 95, 7], [1180, 210, 8], [1500, 120, 10], [300, 360, 5], [1040, 400, 5], [760, 260, 6],
  ]) {
    sparkles += `<path d="M${x} ${y - s} L${x + s * 0.25} ${y - s * 0.25} L${x + s} ${y} L${x + s * 0.25} ${y + s * 0.25} L${x} ${y + s} L${x - s * 0.25} ${y + s * 0.25} L${x - s} ${y} L${x - s * 0.25} ${y - s * 0.25} Z" fill="${p.sparkle}" opacity="0.85"/>`;
  }
  const lantern = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><circle r="26" fill="url(#lanternGlow)"/><rect x="-6" y="-9" width="12" height="16" rx="5" fill="#f4c96b"/><rect x="-7" y="-11" width="14" height="3" rx="1.5" fill="#b8862f"/><rect x="-5" y="7" width="10" height="2.5" rx="1.2" fill="#b8862f"/><path d="M0 -11 L0 -20" stroke="#b8862f" stroke-width="1.2"/></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${p.sky[0]}"/><stop offset="0.55" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/>
  </linearGradient>
  <radialGradient id="moonHalo" cx="0.72" cy="0.3" r="0.42">
    <stop offset="0" stop-color="${p.halo}" stop-opacity="0.32"/><stop offset="1" stop-color="${p.halo}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="lanternGlow"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.75"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  <radialGradient id="windowGlow"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  <linearGradient id="shoot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff8f1" stop-opacity="0"/><stop offset="1" stop-color="#fff8f1" stop-opacity="0.9"/></linearGradient>
  <radialGradient id="nebA"><stop offset="0" stop-color="${p.nebula[0]}"/><stop offset="1" stop-color="${p.nebula[0]}" stop-opacity="0"/></radialGradient>
  <radialGradient id="nebB"><stop offset="0" stop-color="${p.nebula[1]}"/><stop offset="1" stop-color="${p.nebula[1]}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<!-- Soft nebula glows: radial gradients instead of a blur filter, so the image is cheap to draw -->
<g opacity="${p.nebulaOpacity}">
  <ellipse cx="420" cy="230" rx="520" ry="200" fill="url(#nebA)" transform="rotate(-14 420 230)"/>
  <ellipse cx="900" cy="170" rx="470" ry="170" fill="url(#nebB)" transform="rotate(-10 900 170)"/>
  <ellipse cx="1350" cy="300" rx="400" ry="210" fill="url(#nebA)"/>
</g>
<rect width="${W}" height="${H}" fill="url(#moonHalo)"/>
${stars}
${sparkles}
<path d="M250 120 L470 205" stroke="url(#shoot)" stroke-width="2.2" stroke-linecap="round" opacity="${p.shootOpacity}"/>
${lantern(175, 215, 0.85)}${lantern(1045, 135, 0.7)}${lantern(105, 560, 0.6)}
<path d="${cloudRow(735, 70, 7, p.seed + 1)}" fill="${p.clouds[0]}" opacity="0.85"/>
<g transform="translate(1335 640)">
  <path d="M-150 70 C-150 20 -95 -5 -60 15 C-40 -25 30 -30 55 5 C95 -15 150 15 150 70 Z" fill="${p.island}"/>
  <rect x="-48" y="-20" width="96" height="40" rx="4" fill="${p.tower}"/>
  <path d="M-58 -18 A58 58 0 0 1 58 -18 Z" fill="${p.dome}"/>
  <path d="M-6 -74 L6 -74 L6 -18 L-6 -18 Z" fill="${p.slit}"/>
  <rect x="2" y="-96" width="62" height="13" rx="6" transform="rotate(-32 2 -90)" fill="${p.tower}"/>
  <circle cx="-22" cy="2" r="26" fill="url(#windowGlow)"/>
  <rect x="-29" y="-7" width="14" height="16" rx="7" fill="#ffd98a"/>
  <circle cx="24" cy="2" r="20" fill="url(#windowGlow)" opacity="0.7"/>
  <rect x="18" y="-5" width="12" height="13" rx="6" fill="#ffd98a" opacity="0.85"/>
  <text x="-12" y="34" font-family="Georgia, serif" font-size="12" fill="${p.label}" opacity="0.8">No. 07</text>
</g>
<path d="${cloudRow(790, 85, 6, p.seed + 2)}" fill="${p.clouds[1]}" opacity="0.92"/>
<path d="${cloudRow(850, 70, 8, p.seed + 3)}" fill="${p.clouds[2]}"/>
</svg>
`;
}

const night = scene({
  seed: 7,
  sky: ['#0d0820', '#211839', '#3a2c5c'],
  halo: '#f4c96b',
  nebula: ['#7d5fc2', '#c46a9e'],
  nebulaOpacity: 0.32,
  starCount: 170,
  starColors: ['#fff8f1', '#fff8f1', '#f4c96b', '#c9b8f5'],
  sparkle: '#fff1c2',
  shootOpacity: 0.8,
  clouds: ['#2f2552', '#3b2e66', '#4a3a7a'],
  island: '#3e3170',
  tower: '#5a4a8a',
  dome: '#8a6d3f',
  slit: '#2a1f45',
  label: '#f4c96b',
});

const dawn = scene({
  seed: 7,
  sky: ['#f6e4f2', '#f9dfe0', '#fcefe2'],
  halo: '#ffd98a',
  nebula: ['#d8c4f5', '#f5bfd6'],
  nebulaOpacity: 0.5,
  starCount: 60,
  starColors: ['#e0a94a', '#c9a3d9'],
  sparkle: '#e8b35a',
  shootOpacity: 0,
  clouds: ['#f1dff1', '#fae8f0', '#fff6f0'],
  island: '#ead8f2',
  tower: '#cdb6e6',
  dome: '#d9a85a',
  slit: '#9f86c9',
  label: '#a36d2a',
});

fs.mkdirSync('public/images', { recursive: true });
fs.writeFileSync('public/images/hero-night.svg', night);
fs.writeFileSync('public/images/hero-dawn.svg', dawn);
console.log('night', night.length, 'bytes; dawn', dawn.length, 'bytes');
