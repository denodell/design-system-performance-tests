import "../../shared/shadcn/styles.css";
import { h, setup } from "../../shared/react.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../shared/shadcn/radix-ui/select.tsx";
import { Checkbox } from "../../shared/shadcn/radix-ui/checkbox.tsx";
import { Label } from "../../shared/shadcn/radix-ui/label.tsx";

// Uses each component the way shadcn/ui's own "Large List" and "Basic" examples do.
setup({
  Select: ({ options, value, onChange }) => h(Select, { value: value ?? undefined, onValueChange: onChange },
    h(SelectTrigger, { className: "min-w-[200px]" }, h(SelectValue, { placeholder: "Pick" })),
    h(SelectContent, null, h(SelectGroup, null,
      options.map((o) => h(SelectItem, { key: o.value, value: o.value }, o.label))))),
  Checkbox: ({ i, checked, onChange }) => h("div", { className: "flex items-center gap-2" },
    h(Checkbox, { id: `item-${i}`, checked, onCheckedChange: onChange }),
    h(Label, { htmlFor: `item-${i}` }, `Item ${i}`)),
  clickToOpen: "#dd [data-slot=select-trigger]",
  optionInMenu: "[data-slot=select-item]:nth-child(6)",
});
