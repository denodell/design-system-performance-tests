// Sets up a test page for a React design system.
//
// The page renders a select with 249 options and 100 checkboxes, with a "select all" that
// ticks them all in one state update, the way an app would. Add ?n=50 to the page's address
// for a different number of options, and ?m=10 for a different number of checkboxes.
//
// Options:
//   name           The design system's name, as it appears in the results.
//   Select         A component that renders the design system's select.
//                  Props: options (an array of { value, label }), value and onChange(value).
//   Checkbox       A component that renders checkbox number i.
//                  Props: i, checked and onChange(checked).
//   Wrap           Optional. A component around everything, for design systems that need a provider.
//   clickToOpen    A CSS selector for the element a user clicks to open the select.
//   optionInMenu   A CSS selector for an option that appears once the menu is open. Used to check it opened.
//
// The test scripts call the functions this puts on window. They're not meant to be used directly.
import { createElement as h, useState } from "react";
import { createRoot } from "react-dom/client";
export { h };

export function rsetup({ name, Wrap = ({ children }) => children, Select, Checkbox, clickToOpen, optionInMenu }) {
  const params = new URLSearchParams(location.search);
  const optionCount = Number(params.get("n") ?? 249);
  const checkboxCount = Number(params.get("m") ?? 100);
  const options = Array.from({ length: optionCount }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));

  function App() {
    const [checked, setChecked] = useState(() => Array(checkboxCount).fill(false));
    const [value, setValue] = useState(null);
    window.__setAll = () => setChecked(Array(checkboxCount).fill(true));
    const tickOne = (i) => (v) => setChecked((all) => all.map((x, j) => (j === i ? v : x)));
    return h(Wrap, null,
      h("div", { id: "dd" }, h(Select, { options, value, onChange: setValue })),
      h("div", { id: "boxes" }, checked.map((c, i) => h(Checkbox, { key: i, i, checked: c, onChange: tickOne(i) }))));
  }

  window.__lib = name;
  window.__build = () => {
    const host = document.createElement("div");
    document.body.append(host);
    createRoot(host).render(h(App));
  };
  window.__openSel = clickToOpen;
  window.__optionSel = optionInMenu;
  window.__selectAll = () => window.__setAll();
  window.__ready = true;
}
