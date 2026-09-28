# V1 quality assurance — 28 September 2026

- 57 financial tests passed: known payment references, closed-form balances, conservation of principal, zero rates, fees, early payoff, resets, savings budgets, solved thresholds and property equity accounting.
- All 16 calculator defaults and zero-rate paths tested.
- Browser checks exercised each calculator’s update, invalid-input protection, reset and 375px overflow; scenario query prefills and overlarge lump-sum validation also tested.
- All 54 indexable routes loaded; important content remained accessible with JavaScript disabled.
- No JavaScript console errors in the browser suite.
- Metadata/link checks passed for 54 unique titles and H1s, canonical URLs, all sitemap entries and 1,599 internal asset/navigation links.
- axe-core 4.10.3: no WCAG 2 A/AA or 2.1 AA violations on seven representative templates (home, hub, mortgage, buying, moving, guide and scenario).
- Desktop and mobile screenshots inspected for the homepage and a calculator. Automated accessibility checks do not establish full WCAG conformance.
- Repository-root deployment files checked: `index.html`, `CNAME`, `.nojekyll`, `404.html`, `robots.txt`, `sitemap.xml`.

## Limits

These are software/model checks, not regulated financial advice or professional tax/legal review. Live lender schedules, eligibility, property valuations and individual tax liabilities were not verified. The static site requires no live financial-data service. Rates and costs are illustrative; the user supplies transaction tax. DNS and GitHub Pages settings are external to the repository.
