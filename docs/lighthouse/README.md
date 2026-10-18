# Lighthouse measurements

Manual runs against the live site, kept here so the numbers in the README can be checked.

- **When:** 18 Oct 2026, 08:57–08:59 IST (03:27–03:28 UTC)
- **What:** https://lumi-dream-atelier-hax.netlify.app/ (home page)
- **How:** Lighthouse 12.8.2 CLI, default mobile settings (simulated slow 4G, 4x CPU slowdown), headless Chrome

| Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 92 | 100 | 100 | 100 | 1.5 s | 1.5 s | 310 ms | 0.003 |
| 2 | 86 | 100 | 100 | 100 | 1.7 s | 1.7 s | 330 ms | 0.004 |
| 3 | 94 | 100 | 100 | 91 | 1.4 s | 1.4 s | 240 ms | 0.003 |

Lighthouse scores vary between runs and machines; these are single-machine results, not an average.
Open any `.json` file in the [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/) to see the full report.

**Re-run:** `npm run lighthouse` (optionally `npm run lighthouse -- <url>`). It saves a new report here and prints the scores.
