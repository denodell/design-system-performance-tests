import "../../shared/shadcn/styles.css";
import { h, setup } from "../../shared/react.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../shared/shadcn/base-ui/select.tsx";
import { Checkbox } from "../../shared/shadcn/base-ui/checkbox.tsx";
import { Label } from "../../shared/shadcn/base-ui/label.tsx";

// Uses each component the way shadcn/ui's own "Large List" and "Basic" examples do.
setup({
  Select: ({ options, value, onChange }) => {
    const items = [{ label: "Pick", value: null }, ...options];
    return h(Select, { items, value, onValueChange: onChange },
      h(SelectTrigger, { className: "min-w-[200px]" }, h(SelectValue)),
      h(SelectContent, null, h(SelectGroup, null,
        items.map((o) => h(SelectItem, { key: o.value ?? "none", value: o.value }, o.label)))));
  },
  Checkbox: ({ i, checked, onChange }) => h("div", { className: "flex items-center gap-2" },
    h(Checkbox, { id: `item-${i}`, checked, onCheckedChange: onChange }),
    h(Label, { htmlFor: `item-${i}` }, `Item ${i}`)),
  clickToOpen: "#dd [data-slot=select-trigger]",
  optionInMenu: "[data-slot=select-item]:nth-child(7)",
});
