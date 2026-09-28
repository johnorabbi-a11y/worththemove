# Worth The Move

Static UK home-decision comparison website for **https://worththemove.co.uk/**.

## Deploy

The repository is deployable directly through **GitHub Pages → Deploy from a branch → main → /(root)**. All HTML is committed. There is no server, runtime package installation, database, secret, or deployment build step.

`CNAME` contains `worththemove.co.uk`; `.nojekyll` disables Jekyll processing. Confirm the domain’s DNS points to the repository’s Pages service and HTTPS is enabled in GitHub’s settings. Absolute site-root paths target the custom apex domain (a `/worththemove/` project-subpath preview is not the deployment target).

## V1 inventory

**54 indexable URLs**, plus a noindexed custom 404:

- 1 homepage and 6 section hubs
- 16 functioning calculators
- 15 focused guides
- 8 calculated scenario pages
- 8 trust/information pages

### Calculators

1. Remortgage or stay
2. Remortgage break-even
3. Mortgage fee vs no fee
4. 2-year vs 5-year fix
5. 25-year vs 30-year mortgage
6. 25-year vs 35-year mortgage
7. 30-year vs 35-year mortgage
8. Mortgage overpayment versus saving
9. Lump sum vs monthly overpayment
10. Early repayment charge vs switching now
11. Rent vs buy
12. 5% vs 10% deposit
13. 10% vs 20% deposit
14. True cost of buying: two purchase budgets
15. Move vs extend
16. Downsizing versus staying

## Architecture

```text
index.html, 404.html, CNAME, .nojekyll, robots.txt, sitemap.xml
assets/css/site.css                 responsive design system
assets/js/engine.js                 repayment, amortisation, savings, thresholds
assets/js/compare.js                decision models
assets/js/report.js                 shared static/live report rendering
assets/js/app.js                    accessible input behaviour
assets/js/commercial.js             disabled future disclosed commercial component
data/assumptions.js                 illustrative defaults and feature flags
data/calculators.js                 calculator definitions and fields
data/guides.js                      edited guide text
data/scenarios.js                   structured scenario values and analysis
data/sources.js                     URLs, checked dates, affected rules
data/pages.json                    generated indexable URL manifest
scripts/generate.mjs                optional authoring-time HTML generator
scripts/check.mjs                   internal links and metadata checks
scripts/serve.mjs                   local development server only
tests/                             mathematical and browser checks
mortgage/, buying/, moving/         committed static calculator pages
guides/, scenarios/, …              committed static supporting pages
```

The optional generator prevents 54 copies of layout and formulas drifting apart. Edit source data/modules, regenerate, and commit the resulting HTML. Visitors and GitHub Pages do not run the generator. Explanations, forms and a calculated worked report exist in every calculator’s HTML before JavaScript runs.

## Local development and checks

Node.js 22+; the core commands need no installed packages:

```sh
node scripts/generate.mjs
node --test tests/engine.test.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173/`. Optional browser checks use Playwright (`npm install --no-save playwright` and `npx playwright install chromium`), with the local server running:

```sh
node tests/browser.mjs
```

`PLAYWRIGHT_PATH` may point to an existing Playwright module; `BROWSER_CHANNEL=chrome` may use an installed Chrome browser. Optional `tests/accessibility.mjs` requires a local axe-core script supplied through `AXE_PATH`. These QA dependencies are not loaded by the production site. Test screenshots and reports are ignored by Git.

## Financial conventions

- Repayment mortgages use nominal annual rate / 12 and monthly end-of-month payments. Daily lender conventions may differ.
- Financing cost is interest plus fees/charges; principal repayment is not an expense.
- Financed fees accrue interest and are counted once as a fee.
- Mortgage deal break-even compares cumulative interest and fees, not payment reductions. Later reversals are flagged.
- Overpayments keep the ordinary payment and shorten the term, with no overpayment penalties modelled.
- Overpayment, renting and moving tools use equal initial cash and monthly budgets, saving unused funds at the entered effective after-tax rate.
- Deposit and two-property purchase tools invest the upfront cash difference but do not reinvest monthly payment differences. This is disclosed in their reports.
- Rent increases annually; property values compound annually; running costs are level. Figures are nominal and not discounted.
- Extensions are entirely financed immediately; property value added is entered separately. Both moving paths share a rate and remaining term.
- Two-year versus five-year compares 60 months and models one rate reset/new cash fee at month 25.
- ERC switching compares switching now with staying for the chosen period; it does not automatically switch the stay path later.
- Full-term figures assume constant rates. Final equity excludes future selling costs.

See `/methodology/` for the user-facing explanation.

## Values requiring verification

No statutory tax bands or assumed lender overpayment allowances are hard-coded. **Property tax starts at zero as an unfilled allowance**, with visible warnings. Users must enter the official SDLT/LBTT/LTT figure and verify their own reliefs, surcharges and transaction circumstances. The sources page links all three jurisdictions.

Default mortgage rates, fee amounts, valuations, rents, maintenance and building costs are illustrations, not current market offers or estimates. Obtain actual lender/redemption statements and professional quotes. Growth, future reset rates, savings returns and improvement value are scenarios, not forecasts. The repository makes no claim of regulated status or expert financial/legal review.

Before public promotion, the owner should confirm DNS/HTTPS, current contact arrangements and that the privacy/terms accurately describe operations. V1 uses the public GitHub issue tracker as its real contact route; no invented email or operator credentials are published.

## Deliberately deferred

- Buy now versus waiting for a bigger deposit, and cost of waiting to buy
- Separate move-versus-renovate and loft-conversion models
- Automatic jurisdiction-aware property tax with reliefs and surcharges
- Staged building finance, bridging loans and detailed cash timing
- Regional data, live products, large scenario collections and home-energy tools
- Analytics, account features and commercial placements (disabled by default)

Expansion should add a sound comparison model and edited supporting analysis before adding indexable URLs. Do not create keyword-swapped grids.

## QA performed

See `QA.md` for the checked version, results and limitations.
