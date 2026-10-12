// Shared test: build a dropdown with N options and M checkboxes, then hand control to the harness.
export function setup({ name, dropdown, checkbox, wrap = (html) => html, openSel, optionSel, checkboxSel, setChecked }) {
  const q = new URLSearchParams(location.search); const N = +(q.get("n") ?? 249), M = +(q.get("m") ?? 100);
  window.__lib = name;
  window.__build = () => {
    const host = document.createElement("div");
    host.innerHTML = wrap(dropdown(N) + `<div id="boxes">${Array.from({ length: M }, (_, i) => checkbox(i)).join("")}</div>`);
    document.body.append(host);
  };
  window.__openSel = openSel;
  window.__optionSel = optionSel;
  window.__selectAll = () => document.querySelectorAll(checkboxSel).forEach((c) => setChecked(c));
  // Event Timing: how long each user interaction took, including rendering and paint.
  window.__events = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__events.push({ type: e.name, dur: e.duration, start: e.startTime }); })
    .observe({ type: "event", durationThreshold: 16, buffered: true });
  window.__ready = true;
}
