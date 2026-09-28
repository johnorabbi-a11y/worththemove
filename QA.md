# Final pre-indexing QA — 28 September 2026

## Genuine fixes

- assets/js/compare.js: preserve excess equity as savings in Move vs extend when the replacement price is below existing equity. Previously money disappeared from ending wealth and inflated moving cost.
- assets/js/compare.js: display the actual first payment when a lump sum clears the loan or a large overpayment clears it in month one. Retain the original equal-budget savings convention separately.
- assets/js/engine.js: settle the final scheduled instalment exactly. Floating-point residue at maximum balance/rate/term could leave repayment time as null months.
- assets/js/app.js and report.js: directly report costs within £0.50 as effectively equal, without declaring one option cheaper first.
- assets/js/app.js: show the invalid field name and validation message; keep previous valid results visibly stale.
- moving/move-vs-extend/index.html: regenerate the report with a released-equity row and explanation.

## Verification

- 179 financial tests passed: the original 57, 112 calculator/profile cases and 10 targeted independent accounting/regression tests.
- All 16 calculators tested at defaults, minimum, maximum, zero rates, short/long horizons where editable and unusual valid decimals. Fixed horizons/terms retain their scope. Dependent limits respect lump sum <= balance and cash <= required deposit.
- Audited fee financing, fees/ERC counted once, principal conservation, independent present-value balances, rate resets, early repayment, dated savings cash flows, equal budgets, rent/buy wealth, retained deposits, released equity, extension finance/value, break-even and thresholds. No other substantive accounting defect found; disclosed conventions retained.
- 54/54 static routes: unique titles, descriptions and H1s; self-canonicals and Open Graph; no accidental noindex; exact unique sitemap membership; no orphans; 1,653 internal navigation/asset/fragment references valid. Count now includes skip-link fragments.
- CNAME, .nojekyll, robots, sitemap and noindex 404 checked. Exactly 55 HTML files: 54 indexable plus 404.
- Browser: 112 input profiles across 16 tools, update/reset, below-minimum/above-maximum/blank rejection on every tool, cross-field errors, equality announcements and eight scenario prefill links passed. No console errors or nonfinite outputs.
- All 54 local HTTP routes return 200 with one H1 and no 375px document overflow. Original 320px calculator checks passed. All 16 worked examples and explanations checked without JavaScript.
- All 54 pages passed axe-core 4.10.3 WCAG 2 A/AA and 2.1 AA with zero reported violations. Keyboard checks passed: skip link, navigation, visible focus, form editing/submission, disclosures, aria-live, table semantics, mobile navigation and reduced motion. Automated checks do not establish full WCAG conformance.
- Eight scenarios reviewed: distinct assumptions, calculated results, interpretation and working prefill links. Guides, illustrative rates/growth/building costs, entered tax, official sources and internal links reviewed; no substantive defect requiring changes.
- No new pages, tracking, ads, affiliates, recommendations or credentials. Static HTML regenerated; final indexable count remains 54.

## Search Console readiness

Local checks pass. Independent GitHub-hosted verification on 28 September 2026 confirmed trusted HTTPS, HTTP 200 and exact released content for all 54 pages and 11 assets/deployment files, including robots.txt and sitemap.xml. The custom missing-page route returned HTTP 404 with noindex. No unresolved site defect was found that should prevent Search Console submission. Requests from the local Windows environment still fail certificate trust validation; that local/browser trust issue remains, but it was not reproduced by the independent runner. No certificate checks were bypassed.

## Files and reproducibility

Production: assets/js/app.js, compare.js, engine.js, report.js and regenerated moving/move-vs-extend/index.html. QA: scripts/check.mjs, tests/audit.test.mjs, tests/edge-cases.js, tests/browser.mjs, tests/accessibility.mjs, tests/keyboard.mjs and QA.md.

Run npm test and npm run check. Start npm run serve, then run node tests/browser.mjs, node tests/accessibility.mjs and node tests/keyboard.mjs with Playwright. PLAYWRIGHT_PATH and BROWSER_CHANNEL can use an existing installation. Accessibility requires AXE_PATH pointing to axe-core 4.10.3 (default ../work/axe.min.js). No production dependencies added.
