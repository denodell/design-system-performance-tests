import "@mantine/core/styles.css";
import { h, setup } from "../../shared/react.js";
import { MantineProvider, Select, Checkbox } from "@mantine/core";
setup({
  Wrap: ({ children }) => h(MantineProvider, null, children),
  Select: ({ options, value, onChange }) => h(Select, { data: options, value, onChange, placeholder: "Pick", w: 200 }),
  Checkbox: ({ i, checked, onChange }) => h(Checkbox, { checked, onChange: (e) => onChange(e.currentTarget.checked), label: `Item ${i}` }),
  clickToOpen: "#dd input", optionInMenu: '[role="option"][value="v5"]' });
