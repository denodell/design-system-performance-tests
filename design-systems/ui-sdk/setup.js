// The example styles use light-dark() for their colors, which the build would rewrite into a
// form that needs extra setup, so they're added to the page exactly as written.
import tokens from "./tokens.css?raw";
import base from "./base.css?raw";
import select from "./select.css?raw";
import checkbox from "./checkbox.css?raw";
import { h, setup } from "../../shared/react.js";
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectTrigger, SelectValue } from "@ui-sdk/react/select";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

for (const css of [tokens, base, select, checkbox]) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
}

// Uses each component the way UI SDK's own "demo" and "basic" examples do. Its example
// styles only apply inside an element with a data-example attribute, which is on the <body>
// in index.html so the dropdown is styled too.
setup({
  Select: ({ options, value, onChange }) => h(Select, { placeholder: "Pick", value, onValueChange: onChange },
    h(SelectTrigger, null, h(SelectValue), h(ChevronDownIcon)),
    h(SelectContent, null, options.map((o) => h(SelectItem, { key: o.value, value: o.value }, o.label,
      h(SelectItemIndicator, null, h(CheckIcon)))))),
  Checkbox: ({ i, checked, onChange }) => h("label", { "data-slot": "label" },
    h(Checkbox, { checked, onCheckedChange: onChange }, h(CheckboxIndicator, null, h(CheckIcon, { "aria-hidden": "true" }))),
    `Item ${i}`),
  clickToOpen: "#dd [data-slot=select-trigger], #dd button",
  optionInMenu: "[data-slot=select-item]:nth-child(6), [role=option]:nth-child(6)",
});
