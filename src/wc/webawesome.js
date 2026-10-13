import "@awesome.me/webawesome/dist/styles/webawesome.css";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";
import { setup } from "./common.js";
setup({ name: "Web Awesome",
  select: (n) => `<wa-select id="dd" label="Pick">${Array.from({ length: n }, (_, i) => `<wa-option value="v${i}">Option ${i}</wa-option>`).join("")}</wa-select>`,
  checkbox: (i) => `<wa-checkbox>Item ${i}</wa-checkbox>`,
  clickToOpen: "#dd", optionInMenu: "wa-option[value=v5]", checkboxes: "wa-checkbox", check: (c) => (c.checked = true) });
