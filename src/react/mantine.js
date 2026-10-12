import "@mantine/core/styles.css";
import { h, rsetup } from "./rcommon.js";
import { MantineProvider, Select, Checkbox } from "@mantine/core";
rsetup({ name: "Mantine",
  Wrap: ({ children }) => h(MantineProvider, null, children),
  Select: ({ options, value, onChange }) => h(Select, { data: options, value, onChange, placeholder: "Pick", w: 200 }),
  Checkbox: ({ i, checked, onChange }) => h(Checkbox, { checked, onChange: (e) => onChange(e.currentTarget.checked), label: `Item ${i}` }),
  openSel: "#dd input", optionSel: '[role="option"][value="v5"]' });
