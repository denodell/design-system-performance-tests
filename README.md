# Design system performance tests

Measures how long ten design systems take to do two everyday jobs in Chrome:

- Opening a country selector with 249 options
- Ticking 100 checkboxes at once, like a "select all" checkbox in a table showing 100 rows

Each number is how long the browser's main thread stayed busy after the job, in production builds, with the CPU slowed down four times to roughly match a mid-range phone. Each one is the median of three runs.

It also opens each select with 125 options and then 250, to check whether twice the options takes about twice as long or much longer.

The design systems are Mantine, Ant Design, MUI and React Spectrum (React), and Carbon, Fluent, Web Awesome, UI5, Spectrum Web Components and Ionic (web components).

## Run it

You need Node.js 22 or later.

```sh
npm install
npm start
```

`npm install` downloads its own copy of Chrome, so the results don't depend on the browser you have installed. A full run takes around an hour and a half. Close other apps first, since anything else using the CPU makes the numbers higher.

The tables are printed at the end and saved to `results.json`.

## Settings

```sh
RUNS=5 npm run measure                    # more runs per design system
THROTTLE=1 npm run measure                # full CPU speed
ONLY=wc-ionic,wc-fluent npm run measure   # just these pages
EXTRAS=0 npm run measure                  # just the two jobs, which takes around 30 minutes
```

`npm run measure` reuses the last build. Run `npm start` again after changing a package version.

To see a test page yourself, run `npx vite` and open, for example, `http://localhost:5173/wc-ionic.html`. In the browser console, `__build()` adds the select and checkboxes to the page.
