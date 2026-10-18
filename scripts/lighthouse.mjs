// Runs a mobile Lighthouse audit and saves the report to docs/lighthouse/.
// Usage: npm run lighthouse [-- <url>]   (needs Chrome installed)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const url = process.argv[2] || 'https://lumi-dream-atelier-hax.netlify.app/';
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const out = `docs/lighthouse/${stamp}-mobile.json`;
fs.mkdirSync('docs/lighthouse', { recursive: true });

execFileSync('npx', ['-y', 'lighthouse@12', url, '--quiet', '--chrome-flags=--headless=new', '--output=json', `--output-path=${out}`], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const report = JSON.parse(fs.readFileSync(out, 'utf8'));
const scores = Object.values(report.categories).map((c) => `${c.title} ${Math.round(c.score * 100)}`);
const a = report.audits;
console.log(`\n${url}\n${scores.join(' | ')}`);
console.log(`FCP ${a['first-contentful-paint'].displayValue} · LCP ${a['largest-contentful-paint'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue}`);
console.log(`Saved ${out}`);
