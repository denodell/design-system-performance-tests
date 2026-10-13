import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/src/themes.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/checkbox/sp-checkbox.js";
import { setup } from "./common.js";
setup({ name: "Spectrum",
  wrap: (h) => `<sp-theme system="spectrum" color="light" scale="medium">${h}</sp-theme>`,
  select: (n) => `<sp-picker id="dd" label="Pick">${Array.from({ length: n }, (_, i) => `<sp-menu-item value="v${i}">Option ${i}</sp-menu-item>`).join("")}</sp-picker>`,
  checkbox: (i) => `<sp-checkbox>Item ${i}</sp-checkbox>`,
  clickToOpen: "#dd", optionInMenu: "sp-menu-item[value=v5]", checkboxes: "sp-checkbox", check: (c) => (c.checked = true) });
