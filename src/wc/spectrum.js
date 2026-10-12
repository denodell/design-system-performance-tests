import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/src/themes.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/checkbox/sp-checkbox.js";
import { setup } from "./common.js";
setup({ name: "Spectrum",
  wrap: (h) => `<sp-theme system="spectrum" color="light" scale="medium">${h}</sp-theme>`,
  dropdown: (n) => `<sp-picker id="dd" label="Pick">${Array.from({ length: n }, (_, i) => `<sp-menu-item value="v${i}">Option ${i}</sp-menu-item>`).join("")}</sp-picker>`,
  checkbox: (i) => `<sp-checkbox>Item ${i}</sp-checkbox>`,
  openSel: "#dd", optionSel: "sp-menu-item[value=v5]", checkboxSel: "sp-checkbox", setChecked: (c) => (c.checked = true) });
