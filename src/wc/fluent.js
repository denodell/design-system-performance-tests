import { setTheme } from "@fluentui/web-components/theme/set-theme.js";
import { webLightTheme } from "@fluentui/tokens";
import "@fluentui/web-components/dropdown.js";
import "@fluentui/web-components/listbox.js";
import "@fluentui/web-components/option.js";
import "@fluentui/web-components/checkbox.js";
import { setup } from "./common.js";
setTheme(webLightTheme);
setup({ name: "Fluent",
  dropdown: (n) => `<fluent-dropdown id="dd" placeholder="Pick"><fluent-listbox>${Array.from({ length: n }, (_, i) => `<fluent-option value="v${i}">Option ${i}</fluent-option>`).join("")}</fluent-listbox></fluent-dropdown>`,
  checkbox: (i) => `<label><fluent-checkbox></fluent-checkbox> Item ${i}</label>`,
  openSel: "#dd", optionSel: "fluent-option[value=v5]", checkboxSel: "fluent-checkbox", setChecked: (c) => (c.checked = true) });
