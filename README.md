# Design system performance tests

Tests how quickly design system components handle two everyday jobs in Chrome:

- Opening a country selector with 249 options
- Checking 100 checkboxes at once, like a "select all" checkbox in a table showing 100 rows

The repo has pages for ten design systems: Mantine, Ant Design, MUI and React Spectrum (React), and Carbon, Fluent, Web Awesome, UI5, Spectrum Web Components and Ionic (web components). You can add your own.

You need Node.js 22 or later. Start with:

```sh
npm install
```

## Test your design system

The tests in `tests/performance.spec.js` run against one page and pass or fail, so you can run them on every pull request. With the CPU slowed down four times to roughly match a mid-range phone, they check that:

- the select opens in under 300ms, and the screen never freezes for more than 100ms while it opens
- opening the select with 250 options takes no more than about twice as long as with 125
- checking all 100 checkboxes takes under 300ms, and the screen never freezes for more than 100ms

The limits are at the top of the test file. Change them to suit your own components. To print the numbers without failing on the limits, set `REPORT_ONLY=1`.

Run the tests against a page by its file name:

```sh
npx playwright install chromium
PAGE=wc-carbon npm test
```

### Add a page for your design system

Each design system needs two files.

1. A setup file in `src`, which tells the page how to draw your select and checkboxes. For web components it looks like this:

   ```js
   // src/wc/acme.js
   import "@acme/components/select.js";
   import "@acme/components/checkbox.js";
   import { setup } from "./common.js";

   setup({
     name: "Acme",
     // HTML for a select with n options. Give the select id="dd".
     select: (n) => `<acme-select id="dd">${Array.from({ length: n }, (_, i) =>
       `<acme-option value="v${i}">Option ${i}</acme-option>`).join("")}</acme-select>`,
     // HTML for checkbox number i.
     checkbox: (i) => `<acme-checkbox>Item ${i}</acme-checkbox>`,
     // What a user clicks to open the select.
     clickToOpen: "#dd",
     // An option that appears once the menu is open.
     optionInMenu: "acme-option[value=v5]",
     // Every checkbox, and how to check one.
     checkboxes: "acme-checkbox",
     check: (c) => (c.checked = true),
   });
   ```

   For React, use `rsetup` from `src/react/rcommon.js` and pass `Select` and `Checkbox` components instead. `src/react/mui.js` is a short example. Both setup files explain every option at the top.

2. A page in `pages` that loads the setup file:

   ```html
   <!doctype html>
   <meta charset="utf-8">
   <title>Acme</title>
   <body>
   <script type="module" src="../src/wc/acme.js"></script>
   ```

   The `<title>` is the name shown in the results. Name the file `wc-` or `react-` followed by your design system's name, such as `wc-acme.html`, so the results group it with the others.

Then install your design system with npm and run `PAGE=wc-acme npm test`.

### Run the tests on every pull request

In your own repo, a GitHub Actions workflow like this runs the tests whenever someone opens a pull request:

```yaml
name: Performance tests
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
        env:
          PAGE: wc-acme
```

CI machines are often slower than a laptop, so a component can pass on your laptop and go over a time limit in CI. Run the tests in CI a few times before you set the limits. The test that compares 125 options with 250 is the most reliable there, because both runs slow down together.

This repo's own workflow, in `.github/workflows/test.yml`, runs the tests against every page with `REPORT_ONLY=1`. It fails only if a page stops working, and shows each design system's numbers on the run's summary page.

### See a page in the browser

To see a page yourself, run `npx vite` and open, for example, `http://localhost:5173/pages/wc-acme.html`. In the browser console, `__build()` adds the select and checkboxes to the page.

## Compare design systems

`npm start` builds every page and measures each design system, then prints tables comparing them. These are the numbers in the blog post.

```sh
npm start
```

`npm install` downloads its own copy of Chrome, so the results don't depend on the browser you have installed. A full run takes around an hour and a half. Close other apps first, since anything else using the CPU makes the numbers higher. The tables are printed at the end and saved to `results.json`.

```sh
RUNS=5 npm run measure                    # more runs per design system
THROTTLE=1 npm run measure                # full CPU speed
ONLY=wc-ionic,wc-fluent npm run measure   # just these pages
EXTRAS=0 npm run measure                  # just the two jobs, which takes around 30 minutes
```

`npm run measure` reuses the last build. Run `npm start` again after changing a package version.
