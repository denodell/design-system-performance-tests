// Same test as the web component pages: a select with N options and M checkboxes with "select all".
import { createElement as h, useState } from "react";
import { createRoot } from "react-dom/client";
export { h };
export function rsetup({ name, Wrap = ({ children }) => children, Select, Checkbox, openSel, optionSel }) {
  const q = new URLSearchParams(location.search); const N = +(q.get("n") ?? 249), M = +(q.get("m") ?? 100);
  const options = Array.from({ length: N }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));
  function App() {
    const [checked, setChecked] = useState(() => Array(M).fill(false));
    const [value, setValue] = useState(null);
    window.__setAll = () => setChecked(Array(M).fill(true));
    return h(Wrap, null,
      h("div", { id: "dd" }, h(Select, { options, value, onChange: setValue })),
      h("div", { id: "boxes" }, checked.map((c, i) => h(Checkbox, { key: i, i, checked: c, onChange: (v) => setChecked((s) => s.map((x, j) => (j === i ? v : x))) }))));
  }
  window.__lib = name;
  window.__build = () => { const host = document.createElement("div"); document.body.append(host); createRoot(host).render(h(App)); };
  window.__openSel = openSel;
  window.__optionSel = optionSel;
  window.__selectAll = () => window.__setAll();
  window.__events = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__events.push({ type: e.name, dur: e.duration, start: e.startTime }); })
    .observe({ type: "event", durationThreshold: 16, buffered: true });
  window.__ready = true;
}
