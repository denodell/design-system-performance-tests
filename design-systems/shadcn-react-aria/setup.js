import "../../shared/shadcn/styles.css";
import { h, setup } from "../../shared/react.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../shared/shadcn/react-aria/select.tsx";
import { Checkbox } from "../../shared/shadcn/react-aria/checkbox.tsx";
import { Label } from "../../shared/shadcn/react-aria/label.tsx";

// Uses each component the way shadcn/ui's own "Large List" and "Basic" examples do.
setup({
  Select: ({ options, value, onChange }) => h(Select, { "aria-label": "Country", placeholder: "Pick", value, onChange },
    h(SelectTrigger, { className: "min-w-[200px]" }, h(SelectValue)),
    h(SelectContent, null, h(SelectGroup, null,
      options.map((o) => h(SelectItem, { key: o.value, id: o.value }, o.label))))),
  Checkbox: ({ i, checked, onChange }) => h("div", { className: "flex items-center gap-2" },
    h(Checkbox, { id: `item-${i}`, isSelected: checked, onChange }),
    h(Label, { htmlFor: `item-${i}` }, `Item ${i}`)),
  clickToOpen: "#dd [data-slot=select-trigger]",
  optionInMenu: "[data-slot=select-item]:nth-child(6)",
});
