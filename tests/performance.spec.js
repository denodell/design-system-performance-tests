// Performance tests for one design system's test page.
// Run them with the page's file name, for example: PAGE=wc-carbon npm test
// Set REPORT_ONLY=1 to print the numbers without failing on the limits. The tests still fail
// if the page doesn't work, such as a select that doesn't open.
//
// Each test slows the CPU down four times, roughly matching a mid-range phone, and measures:
// - how long the browser's main thread stays busy after the action, from Chrome's TaskDuration
// - the longest single frame, from the Long Animation Frames API, which is how long the screen froze
import { appendFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const PAGE = process.env.PAGE ?? "wc-carbon";
const REPORT_ONLY = Boolean(process.env.REPORT_ONLY);

// The limits. Each team can set its own from what its components measure today.
const OPEN_BUDGET = 300; // ms the page can stay busy opening a select with 249 options
const SELECT_ALL_BUDGET = 300; // ms the page can stay busy checking 100 checkboxes
const FREEZE_LIMIT = 100; // ms, about where a response stops feeling instant
const DOUBLING_LIMIT = 2.5; // twice the options can take at most this many times as long

const THROTTLE = 4;

// Checks a number against its limit, unless REPORT_ONLY is set.
function within(value, limit) {
  if (!REPORT_ONLY) expect.soft(value).toBeLessThan(limit);
}

// Prints a result, and adds it to the run's summary page when running on GitHub Actions.
function report(line) {
  console.log(`${PAGE}: ${line}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- ${line}\n`);
}

// Opens the test page with the given number of options and checkboxes, and adds them to the page.
async function load(page, { options, checkboxes }) {
  await page.goto(`/pages/${PAGE}.html?n=${options}&m=${checkboxes}`);
  await page.waitForFunction(() => window.__ready);
  // Slow the CPU down after loading, since loading the page can move it to a new process.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
  await page.evaluate(() => window.__build());
  const select = page.locator(await page.evaluate(() => window.__openSel)).first();
  await select.waitFor({ state: "attached" });
  await select.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(2500 * THROTTLE); // let the page finish setting up
  return { cdp, select };
}

// Runs the action, then returns how long the main thread was busy and the longest freeze.
async function measure(page, cdp, action, settle) {
  const busy = async () => {
    const { metrics } = await cdp.send("Performance.getMetrics");
    return metrics.find((m) => m.name === "TaskDuration").value * 1000;
  };
  await page.evaluate(() => {
    window.slowFrames = [0];
    new PerformanceObserver((list) => {
      for (const frame of list.getEntries()) window.slowFrames.push(frame.duration);
    }).observe({ type: "long-animation-frame" });
  });

  const before = await busy();
  await action();
  await page.waitForTimeout(settle * THROTTLE); // time to finish, including any animation
  return {
    ms: (await busy()) - before,
    longestFreeze: await page.evaluate(() => Math.max(...window.slowFrames)),
  };
}

// Clicks the select near its left edge, where its button usually is, the way the tables in
// the post were measured. Some selects have no size of their own, so this looks for the first
// drawn element inside them, and falls back to clicking from JavaScript.
async function open(page, select) {
  const point = await select.evaluate((el) => {
    const boxOf = (node) => { const r = node.getBoundingClientRect(); return r.width && r.height ? r : null; };
    const box = boxOf(el) ?? [...(el.shadowRoot?.querySelectorAll("*") ?? []), ...el.querySelectorAll("*")].map(boxOf).find(Boolean);
    return box ? { x: box.x + Math.min(box.width / 2, 30), y: box.y + box.height / 2 } : null;
  });
  if (point) await page.mouse.click(point.x, point.y);
  else await select.evaluate((el) => el.click());
}

async function openSelect(page, options) {
  const { cdp, select } = await load(page, { options, checkboxes: 0 });
  const result = await measure(page, cdp, () => open(page, select), 1500);
  // Check the menu really opened, so a missed click can't pass as a fast one.
  const option = page.locator(await page.evaluate(() => window.__optionSel)).first();
  await expect(option, "the menu didn't open").toBeVisible();
  return result;
}

test("opens a select with 249 options quickly", async ({ page }) => {
  const { ms, longestFreeze } = await openSelect(page, 249);
  report(`Opening a select with 249 options took ${Math.round(ms)}ms, longest freeze ${Math.round(longestFreeze)}ms`);
  within(ms, OPEN_BUDGET);
  within(longestFreeze, FREEZE_LIMIT);
});

test("twice the options takes no more than about twice as long to open", async ({ page }) => {
  // Small times vary a lot from run to run, so use the middle of three runs at each size.
  const median = (values) => values.sort((a, b) => a - b)[1];
  const time = async (options) => {
    const runs = [];
    for (let i = 0; i < 3; i++) runs.push((await openSelect(page, options)).ms);
    return median(runs);
  };
  const small = await time(125);
  const large = await time(250);
  const ratio = large / small;
  report(`Opening with 125 options took ${Math.round(small)}ms, and with 250 took ${Math.round(large)}ms (${ratio.toFixed(1)} times as long)`);
  within(ratio, DOUBLING_LIMIT);
});

test("checks 100 checkboxes at once quickly", async ({ page }) => {
  const { cdp } = await load(page, { options: 10, checkboxes: 100 });
  const { ms, longestFreeze } = await measure(page, cdp, () => page.evaluate(() => window.__selectAll()), 2500);
  report(`Checking 100 checkboxes took ${Math.round(ms)}ms, longest freeze ${Math.round(longestFreeze)}ms`);
  within(ms, SELECT_ALL_BUDGET);
  within(longestFreeze, FREEZE_LIMIT);
});
