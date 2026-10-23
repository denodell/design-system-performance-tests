import "@carbon/web-components/es/components/dropdown/index.js";
import "@carbon/web-components/es/components/checkbox/index.js";
import { setup } from "../../shared/web-components.js";
setup({
  select: (n) => `<cds-dropdown id="dd" title-text="Pick" label="Pick">${Array.from({ length: n }, (_, i) => `<cds-dropdown-item value="v${i}">Option ${i}</cds-dropdown-item>`).join("")}</cds-dropdown>`,
  checkbox: (i) => `<cds-checkbox>Item ${i}</cds-checkbox>`,
  clickToOpen: "#dd", optionInMenu: "cds-dropdown-item[value=v5]", checkboxes: "cds-checkbox", check: (c) => (c.checked = true) });
