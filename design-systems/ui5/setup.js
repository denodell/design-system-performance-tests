import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/CheckBox.js";
import { setup } from "../../shared/web-components.js";
setup({
  select: (n) => `<ui5-select id="dd">${Array.from({ length: n }, (_, i) => `<ui5-option value="v${i}">Option ${i}</ui5-option>`).join("")}</ui5-select>`,
  checkbox: (i) => `<ui5-checkbox text="Item ${i}"></ui5-checkbox>`,
  clickToOpen: "#dd", optionInMenu: "ui5-option[value=v5]", checkboxes: "ui5-checkbox", check: (c) => (c.checked = true) });
