import "@carbon/web-components/es/components/dropdown/index.js";
import "@carbon/web-components/es/components/checkbox/index.js";
import { setup } from "./common.js";
setup({ name: "Carbon",
  dropdown: (n) => `<cds-dropdown id="dd" title-text="Pick" label="Pick">${Array.from({ length: n }, (_, i) => `<cds-dropdown-item value="v${i}">Option ${i}</cds-dropdown-item>`).join("")}</cds-dropdown>`,
  checkbox: (i) => `<cds-checkbox>Item ${i}</cds-checkbox>`,
  openSel: "#dd", optionSel: "cds-dropdown-item[value=v5]", checkboxSel: "cds-checkbox", setChecked: (c) => (c.checked = true) });
