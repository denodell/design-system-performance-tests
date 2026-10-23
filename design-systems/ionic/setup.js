import "@ionic/core/css/core.css";
import { initialize } from "@ionic/core/components";
import { defineCustomElement as defSelect } from "@ionic/core/components/ion-select.js";
import { defineCustomElement as defOption } from "@ionic/core/components/ion-select-option.js";
import { defineCustomElement as defPopover } from "@ionic/core/components/ion-popover.js";
import { defineCustomElement as defSelectPopover } from "@ionic/core/components/ion-select-popover.js";
import { defineCustomElement as defCheckbox } from "@ionic/core/components/ion-checkbox.js";
import { setup } from "../../shared/web-components.js";
initialize();
defSelect(); defOption(); defPopover(); defSelectPopover(); defCheckbox();
setup({
  select: (n) => `<ion-select id="dd" label="Pick" interface="popover">${Array.from({ length: n }, (_, i) => `<ion-select-option value="v${i}">Option ${i}</ion-select-option>`).join("")}</ion-select>`,
  checkbox: (i) => `<ion-checkbox>Item ${i}</ion-checkbox>`,
  clickToOpen: "#dd", optionInMenu: "ion-select-popover ion-radio[value=v5], ion-popover ion-item:nth-of-type(6)", checkboxes: "ion-checkbox", check: (c) => (c.checked = true) });
