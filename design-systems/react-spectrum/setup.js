import { h, setup } from "../../shared/react.js";
import { Provider, defaultTheme, Picker, Item, Checkbox } from "@adobe/react-spectrum";
setup({
  Wrap: ({ children }) => h(Provider, { theme: defaultTheme, colorScheme: "light" }, children),
  Select: ({ options, value, onChange }) => h(Picker, { label: "Pick", items: options, selectedKey: value, onSelectionChange: onChange }, (o) => h(Item, { key: o.value }, o.label)),
  Checkbox: ({ i, checked, onChange }) => h(Checkbox, { isSelected: checked, onChange }, `Item ${i}`),
  clickToOpen: '#dd button[aria-haspopup="listbox"]', optionInMenu: '[role="option"][data-key="v5"]' });
