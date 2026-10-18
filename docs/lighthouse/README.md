# Lighthouse measurements

Manual runs against the live site, kept here so the numbers in the README can be checked.

- **When:** 18 Oct 2026, 21:53–21:55 IST (16:23–16:25 UTC)
- **What:** https://lumi-dream-atelier-hax.netlify.app/ (home page)
- **How:** Lighthouse 12.8.2 CLI, default mobile settings (simulated slow 4G, 4x CPU slowdown), headless Chrome

| Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 84 | 100 | 100 | 100 | 2.5 s | 2.5 s | 340 ms | 0.001 |
| 2 | 82 | 100 | 100 | 100 | 2.2 s | 2.2 s | 460 ms | 0.001 |
| 3 | 85 | 100 | 100 | 100 | 1.6 s | 1.6 s | 460 ms | 0.001 |

Lighthouse scores vary between runs and machines; these are single-machine results, not an average.
Open any `.json` file in the [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/) to see the full report.

**Re-run:** `npm run lighthouse` (optionally `npm run lighthouse -- <url>`). It saves a new report here and prints the scores.
