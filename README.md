# Design system performance tests

Tests how quickly design system components handle two tasks that real apps do all the time, in Chrome:

- Opening a country selector with 249 options
- Checking 100 checkboxes at once, like a "select all" checkbox above a list of 100 messages

Each design system has its own folder in `design-systems`. There are ten so far: Mantine, Ant Design, Material UI and React Spectrum, built with React, and Carbon, Fluent, Web Awesome, UI5, Spectrum Web Components and Ionic, built with web components. You can add your own by copying a folder.

You need Node.js 22 or later. Start with:

```sh
npm install
npx playwright install chromium
```

## Run the tests

The tests check that, with the CPU slowed down four times to roughly match a mid-range phone:

- the country selector opens in under 300ms, and the UI never stops responding for more than 100ms while it opens
- opening it with 250 options takes no more than about twice as long as with 125
- checking all 100 checkboxes takes under 300ms, and the UI never stops responding for more than 100ms

Run them for every design system:

```sh
npm test
```

Or for just one, by its folder name:

```sh
npx playwright test design-systems/ionic
```

To print the measurements without failing on the limits, set `REPORT_ONLY=1`. The tests still fail if the page stops working, such as a dropdown that doesn't open.

## Add your design system

Every folder in `design-systems` has the same four files:

```
design-systems/
└── nettle/
    ├── index.html            the test page
    ├── setup.js              how to build your dropdown and checkboxes
    ├── performance.spec.js   runs the tests, with any limits of your own
    └── package.json          your design system's npm packages
```

The easiest way to start is to copy the folder of a design system built the same way as yours, such as `carbon` for web components or `material-ui` for React, and give it your design system's name. Then change each file.

**`index.html`** loads `setup.js`. Its `<title>` is the name shown in the results.

```html
<!doctype html>
<meta charset="utf-8">
<title>Nettle</title>
<body>
<script type="module" src="./setup.js"></script>
```

**`setup.js`** tells the test page how to build your dropdown and checkboxes. For web components it looks like this:

```js
import "@nettle/components/select.js";
import "@nettle/components/checkbox.js";
import { setup } from "../../shared/web-components.js";

setup({
  // HTML for a dropdown with n options. Give the dropdown id="dd".
  select: (n) => `<nettle-select id="dd">${Array.from({ length: n }, (_, i) =>
    `<nettle-option value="v${i}">Option ${i}</nettle-option>`).join("")}</nettle-select>`,
  // HTML for checkbox number i.
  checkbox: (i) => `<nettle-checkbox>Item ${i}</nettle-checkbox>`,
  // What a user clicks to open the dropdown.
  clickToOpen: "#dd",
  // An option that appears once the dropdown is open.
  optionInMenu: "nettle-option[value=v5]",
  // Every checkbox, and how to check one.
  checkboxes: "nettle-checkbox",
  check: (c) => (c.checked = true),
});
```

For React, import `setup` from `../../shared/react.js` instead, and pass `Select` and `Checkbox` components. `design-systems/material-ui/setup.js` is a short example. Both files in `shared` explain every option at the top.

**`performance.spec.js`** runs the shared tests against your folder. It usually doesn't need changing. To set limits for your design system only, pass them in:

```js
import { testDesignSystem } from "../../shared/tests.js";

testDesignSystem(import.meta.dirname, { openMs: 200, unresponsiveMs: 50 });
```

The limits you can set are `openMs`, `selectAllMs`, `unresponsiveMs` and `doublingRatio`. The defaults are at the top of `shared/tests.js`.

**`package.json`** lists your design system's npm packages, at the versions you want to test. `framework` is shown next to its name in the comparison tables.

```json
{
  "name": "nettle-performance-tests",
  "private": true,
  "type": "module",
  "description": "Performance tests for Nettle.",
  "framework": "Lit",
  "dependencies": {
    "@nettle/components": "4.2.0"
  }
}
```

Then run `npm install` and `npx playwright test design-systems/nettle`.

### Run the tests on every pull request

In your own repo, a GitHub Actions workflow like this runs the tests whenever someone opens a pull request:

```yaml
name: Performance tests
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test design-systems/nettle
        env:
          PUPPETEER_SKIP_DOWNLOAD: "true"
```

CI machines are often slower than a development machine, so a component can pass locally but go over a time limit in CI. Run the tests in CI a few times first before you set the limits. The test that compares 125 options with 250 is the most reliable there, because both runs slow down together.

This repo's own workflow, in `.github/workflows/test.yml`, runs each design system as a separate job with `REPORT_ONLY=1`. It fails only if a page stops working, and shows each design system's measurements on the run's summary page.

### See a page in the browser

To see a page yourself, run `npx vite` and open, for example, `http://localhost:5173/design-systems/nettle/index.html`. In the browser console, `__build()` adds the dropdown and checkboxes to the page.

## Compare design systems

`npm start` builds every page and measures each design system, then prints tables comparing them. These are the measurements in the blog post.

```sh
npm start
```

`npm install` downloads its own copy of Chrome, so the results don't depend on the browser you have installed. A full run takes around an hour and a half. Close other apps first, since anything else using the CPU makes the measurements higher. The tables are printed at the end and saved to `results.json`.

```sh
RUNS=5 npm run measure                 # more runs per design system
THROTTLE=1 npm run measure             # full CPU speed
ONLY=ionic,fluent npm run measure      # just these folders
EXTRAS=0 npm run measure               # just the two tasks, which takes around 30 minutes
```

`npm run measure` reuses the last build. Run `npm start` again after changing a package version.
