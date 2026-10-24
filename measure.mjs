// Opens each design system's test page in Chrome and measures two tasks:
// opening a country selector with 249 options, and checking 100 checkboxes at once.
// Each number is how long the main thread stayed busy afterwards, as the median of several runs.
//
// It also measures:
// - Ionic and Fluent opening with 50 options, to show how the time grows with the list
// - each country selector opening with 125 options and then 250, to show whether twice the
//   options takes about twice as long, or much longer
// - Ant Design checking all 100 checkboxes with animations turned off, to show how much of
//   that time goes on the checkbox animation
//
// Settings (environment variables):
//   RUNS=3        how many times to run each page
//   THROTTLE=4    how much to slow the CPU down (1 = full speed)
//   ONLY=ionic,material-ui   run only these design systems, by folder name
//   EXTRAS=0      skip the extra measurements above

import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";

const RUNS = Number(process.env.RUNS ?? 3);
const THROTTLE = Number(process.env.THROTTLE ?? 4);
const root = path.join(import.meta.dirname, "dist");
// Uses the Chrome that `npm install` downloaded. Set DS_PERF_CHROME to use a different one.
const chromePath = process.env.DS_PERF_CHROME || undefined;

// Every folder in design-systems. The name is the <title> of its index.html, and the
// framework is the "framework" field in its package.json.
const designSystemsDir = path.join(import.meta.dirname, "design-systems");
const designSystems = fs.readdirSync(designSystemsDir)
  .filter((folder) => fs.existsSync(path.join(designSystemsDir, folder, "index.html")))
  .map((folder) => {
    const html = fs.readFileSync(path.join(designSystemsDir, folder, "index.html"), "utf8");
    const pkgFile = path.join(designSystemsDir, folder, "package.json");
    const pkg = fs.existsSync(pkgFile) ? JSON.parse(fs.readFileSync(pkgFile, "utf8")) : {};
    return { folder, name: html.match(/<title>(.*?)<\/title>/)?.[1] ?? folder, framework: pkg.framework ?? "" };
  })
  .filter(({ folder }) => !process.env.ONLY || process.env.ONLY.split(",").includes(folder));

if (!fs.existsSync(root)) {
  console.error("No dist folder. Run `npm run build` first, or `npm start` to build and measure.");
  process.exit(1);
}
// A build from before a design system was added, or from an older version of this repo,
// won't have its page, so every run would time out waiting for it.
const unbuilt = designSystems.filter(({ folder }) => !fs.existsSync(path.join(root, "design-systems", folder, "index.html")));
if (unbuilt.length) {
  console.error(`The build in dist is out of date. It's missing ${unbuilt.map((d) => d.name).join(", ")}.`);
  console.error("Run `npm run build` first, or `npm start` to build and measure.");
  process.exit(1);
}

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    res.end(body);
  });
}).listen(0);
const origin = `http://localhost:${server.address().port}`;

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

async function busy(cdp) {
  const { metrics } = await cdp.send("Performance.getMetrics");
  return metrics.find((m) => m.name === "TaskDuration").value * 1000;
}

// Run `action`, then measure two things while the page finishes responding:
// how long the main thread stayed busy in total, and the longest time the UI stopped
// responding, meaning the longest frame the browser took to draw. Chrome only reports frames
// over 50ms, so 0 means every frame was drawn in under 50ms. Listening for slow frames adds
// no work to the page. Waits longer when the CPU is slowed down.
async function measure(page, cdp, action, settle) {
  await page.evaluate(() => {
    window.__slowFrames = [];
    window.__frameObserver?.disconnect();
    window.__frameObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__slowFrames.push(entry.duration);
    });
    window.__frameObserver.observe({ type: "long-animation-frame" });
  });
  const before = await busy(cdp);
  await action();
  await pause(settle * THROTTLE);
  const total = (await busy(cdp)) - before;
  const freeze = await page.evaluate(() => {
    window.__frameObserver.disconnect();
    return Math.max(0, ...window.__slowFrames);
  });
  return { busy: total, freeze };
}

// Click the first element matching one of the selectors, looking inside shadow roots too.
// Uses a real mouse click where the element has a size on screen, and falls back to
// element.click() for elements the browser hasn't drawn a box for. Waits for it to appear first.
async function clickElement(page, selectors, timeout) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const target = await page.evaluate((selectors) => {
      const find = (rootNode, sel) => {
        const el = rootNode.querySelector(sel);
        if (el) return el;
        for (const node of rootNode.querySelectorAll("*")) {
          if (node.shadowRoot) { const found = find(node.shadowRoot, sel); if (found) return found; }
        }
        return null;
      };
      const boxOf = (el) => { const r = el.getBoundingClientRect(); return r.width && r.height ? r : null; };
      for (const sel of selectors.split(", ")) {
        const el = find(document, sel);
        if (!el) continue;
        el.scrollIntoView({ block: "center" });
        // Some hosts have no box of their own, so look for the first drawn element inside them.
        let box = boxOf(el);
        if (!box) {
          const inner = [...(el.shadowRoot?.querySelectorAll("*") ?? []), ...el.querySelectorAll("*")].find(boxOf);
          box = inner && boxOf(inner);
        }
        if (box) return { x: box.x + Math.min(box.width / 2, 30), y: box.y + box.height / 2 };
        window.__clickTarget = el;
        return { js: true };
      }
      return null;
    }, selectors);
    if (target?.js) { await page.evaluate(() => window.__clickTarget.click()); return true; }
    if (target) { await page.mouse.click(target.x, target.y); return true; }
    await pause(250);
  }
  return false;
}

// True once an element matching one of the selectors is on the page, including inside shadow roots.
async function isShown(page, selectors) {
  return page.evaluate((selectors) => {
    const find = (rootNode, sel) => {
      const el = rootNode.querySelector(sel);
      if (el) return el;
      for (const node of rootNode.querySelectorAll("*")) {
        if (node.shadowRoot) { const found = find(node.shadowRoot, sel); if (found) return found; }
      }
      return null;
    };
    return selectors.split(", ").some((sel) => {
      const el = find(document, sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }, selectors);
}

async function runOnce(browser, page, query, noAnimations) {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1280, height: 900 });
  const cdp = await tab.createCDPSession();
  await cdp.send("Performance.enable");
  if (THROTTLE > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

  await tab.goto(`${origin}/design-systems/${page}/index.html${query}`, { waitUntil: "networkidle0", timeout: 120000 });
  await tab.waitForFunction("window.__ready", { timeout: 60000 });
  await pause(800);
  await tab.evaluate(() => window.__build());
  await pause(2500 * THROTTLE);

  const openSel = await tab.evaluate(() => window.__openSel);
  // Make sure the country selector is on the page before starting the clock.
  const deadline = Date.now() + 10000 * THROTTLE;
  while (!(await isShown(tab, openSel)) && Date.now() < deadline) await pause(250);

  const open = await measure(tab, cdp, async () => {
    if (!(await clickElement(tab, openSel, 5000))) throw new Error("couldn't find the country selector to click");
  }, 1500);

  const optionSel = await tab.evaluate(() => window.__optionSel);
  const optionsVisible = await isShown(tab, optionSel);
  await tab.keyboard.press("Escape");
  await pause(1000 * THROTTLE);

  if (noAnimations) {
    await tab.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
    await pause(500 * THROTTLE);
  }
  const selectAll = await measure(tab, cdp, () => tab.evaluate(() => window.__selectAll()), 2500);
  await tab.close();
  return { open, selectAll, optionsVisible };
}

async function run(page, query, noAnimations = false) {
  const results = [];
  for (let i = 0; i < RUNS; i++) {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: ["--no-sandbox"],
    });
    try {
      results.push(await runOnce(browser, page, query, noAnimations));
    } finally {
      await browser.close();
    }
  }
  if (results.some((r) => !r.optionsVisible)) {
    console.warn(`  ${page}: the dropdown hadn't finished opening when the time was read, so its number may be too low.`);
  }
  return {
    open: median(results.map((r) => r.open.busy)),
    openFreeze: median(results.map((r) => r.open.freeze)),
    selectAll: median(results.map((r) => r.selectAll.busy)),
    selectAllFreeze: median(results.map((r) => r.selectAll.freeze)),
  };
}

const ms = (n) => `${Math.round(n).toLocaleString("en-US")}ms`;
const unresponsiveMs = (n) => (n > 0 ? ms(n) : "Under 50ms");
const browser = await puppeteer.launch({ headless: true, executablePath: chromePath, args: ["--no-sandbox"] });
const chromeVersion = await browser.version();
await browser.close();

const major = Number(chromeVersion.match(/\/(\d+)/)?.[1]);
if (major < 125) {
  console.error(`This run is using ${chromeVersion}, which is too old for some of the design systems.`);
  console.error("Something on this computer is pointing Puppeteer at an old Chrome, usually the PUPPETEER_EXECUTABLE_PATH environment variable.");
  console.error("Run `unset PUPPETEER_EXECUTABLE_PATH` and try again, or set DS_PERF_CHROME to a recent Chrome.");
  process.exit(1);
}

console.log(`Machine: ${os.cpus()[0]?.model ?? "unknown"} (${os.cpus().length} cores), ${Math.round(os.totalmem() / 2 ** 30)}GB, ${os.platform()} ${os.release()}`);
console.log(`Browser: ${chromeVersion}, CPU slowed down ${THROTTLE}x, median of ${RUNS} runs\n`);

const results = {};
const failed = [];
for (const { folder: page, name, framework } of designSystems) {
  process.stdout.write(`Measuring ${name}...\n`);
  try {
    results[page] = { name, framework, ...(await run(page, "?n=249&m=100")) };
  } catch (error) {
    console.warn(`  Skipped ${name}: ${error.message}`);
    failed.push(name);
  }
}

const extras = process.env.EXTRAS !== "0";

// Ionic and Fluent again with 50 options, to show how Ionic's time grows with the list.
const small = {};
for (const page of ["ionic", "fluent"].filter((p) => extras && results[p])) {
  process.stdout.write(`Measuring ${results[page].name} with 50 options...\n`);
  try {
    const r = await run(page, "?n=50&m=0");
    small[page] = { open: r.open, freeze: r.openFreeze };
  } catch (error) {
    console.warn(`  Skipped: ${error.message}`);
  }
}

// Every country selector with 125 options and then 250. Twice the options should take up to
// about twice as long. Much more than that means it repeats work for every option.
const doubling = {};
for (const page of Object.keys(results).filter(() => extras)) {
  process.stdout.write(`Measuring ${results[page].name} with 125 and 250 options...\n`);
  try {
    const a = await run(page, "?n=125&m=0");
    const b = await run(page, "?n=250&m=0");
    doubling[page] = { open125: a.open, open250: b.open, ratio: b.open / a.open };
  } catch (error) {
    console.warn(`  Skipped: ${error.message}`);
  }
}

// Ant Design checking all 100 checkboxes with animations turned off.
let noAnimations = null;
if (extras && results["ant-design"]) {
  process.stdout.write("Measuring Ant Design checking all the checkboxes with animations off...\n");
  try {
    const r = await run("ant-design", "?n=10&m=100", true);
    noAnimations = { selectAll: r.selectAll, withAnimations: results["ant-design"].selectAll };
  } catch (error) {
    console.warn(`  Skipped: ${error.message}`);
  }
}

server.close();

// The same two tables as the blog post, fastest first.
const table = (title, column, time, unresponsive) => {
  console.log(`\n${title}\n`);
  console.log(`| Design system | Framework | ${column} | Longest time unresponsive |`);
  console.log("| --- | --- | --- | --- |");
  for (const r of Object.values(results).sort((a, b) => a[time] - b[time])) {
    console.log(`| ${r.name} | ${r.framework} | ${ms(r[time])} | ${unresponsiveMs(r[unresponsive])} |`);
  }
};
if (Object.keys(results).length) {
  table("Opening a country selector with 249 options", "Time to open", "open", "openFreeze");
  table("Checking 100 checkboxes at once", "Time to select", "selectAll", "selectAllFreeze");
}
if (Object.keys(small).length) {
  console.log("\nOpening with 50 options");
  for (const [page, value] of Object.entries(small)) console.log(`  ${results[page].name}: ${ms(value.open)}, longest time unresponsive ${unresponsiveMs(value.freeze)}`);
}
if (Object.keys(doubling).length) {
  console.log("\nOpening with 125 options, then 250");
  console.log("| Design system | 125 options | 250 options | How many times as long |");
  console.log("| --- | --- | --- | --- |");
  for (const [page, d] of Object.entries(doubling).sort((a, b) => a[1].ratio - b[1].ratio)) {
    console.log(`| ${results[page].name} | ${ms(d.open125)} | ${ms(d.open250)} | ${d.ratio.toFixed(1)} |`);
  }
}
if (noAnimations) {
  console.log(`\nAnt Design checking all 100 checkboxes: ${ms(noAnimations.withAnimations)} with animations, ${ms(noAnimations.selectAll)} without`);
}

fs.writeFileSync(path.join(import.meta.dirname, "results.json"), JSON.stringify({ chromeVersion, throttle: THROTTLE, runs: RUNS, results, fiftyOptions: small, doubling, noAnimations }, null, 2));
if (failed.length) console.log(`\nCouldn't measure: ${failed.join(", ")}. Send me the warnings above.`);
console.log("\nSaved to results.json");
