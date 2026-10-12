import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/CheckBox.js";
import { setup } from "./common.js";
setup({ name: "UI5",
  dropdown: (n) => `<ui5-select id="dd">${Array.from({ length: n }, (_, i) => `<ui5-option value="v${i}">Option ${i}</ui5-option>`).join("")}</ui5-select>`,
  checkbox: (i) => `<ui5-checkbox text="Item ${i}"></ui5-checkbox>`,
  openSel: "#dd", optionSel: "ui5-option[value=v5]", checkboxSel: "ui5-checkbox", setChecked: (c) => (c.checked = true) });
