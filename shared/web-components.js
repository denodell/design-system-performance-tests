// Sets up the test page for a web component design system.
//
// The page builds a select with 249 options and 100 checkboxes. Add ?n=50 to the page's
// address for a different number of options, and ?m=10 for a different number of checkboxes.
//
// Each design system's setup.js calls this. The design system's name, as it appears in the
// results, is the <title> of its index.html.
//
// Options:
//   select         Returns the HTML for a select with n options. Give the select id="dd".
//   checkbox       Returns the HTML for checkbox number i.
//   wrap           Optional. Wraps all the HTML, for design systems that need a theme element around it.
//   clickToOpen    A CSS selector for the element a user clicks to open the select.
//   optionInMenu   A CSS selector for an option that appears once the menu is open. Used to check it opened.
//   checkboxes     A CSS selector that matches every checkbox.
//   check          Checks one checkbox, given the element. Usually (c) => (c.checked = true).
//
// The test scripts call the functions this puts on window. They're not meant to be used directly.
export function setup({ select, checkbox, wrap = (html) => html, clickToOpen, optionInMenu, checkboxes, check }) {
  const params = new URLSearchParams(location.search);
  const optionCount = Number(params.get("n") ?? 249);
  const checkboxCount = Number(params.get("m") ?? 100);

  window.__build = () => {
    const host = document.createElement("div");
    const boxes = Array.from({ length: checkboxCount }, (_, i) => checkbox(i)).join("");
    host.innerHTML = wrap(select(optionCount) + `<div id="boxes">${boxes}</div>`);
    document.body.append(host);
  };
  window.__openSel = clickToOpen;
  window.__optionSel = optionInMenu;
  window.__selectAll = () => document.querySelectorAll(checkboxes).forEach((c) => check(c));
  window.__ready = true;
}
