import { h, rsetup } from "./rcommon.js";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
rsetup({ name: "MUI",
  Select: ({ options, value, onChange }) => h(Select, { value: value ?? "", onChange: (e) => onChange(e.target.value), displayEmpty: true, style: { minWidth: 200 } },
    h(MenuItem, { value: "" }, "Pick"), options.map((o) => h(MenuItem, { key: o.value, value: o.value }, o.label))),
  Checkbox: ({ i, checked, onChange }) => h(FormControlLabel, { control: h(Checkbox, { checked, onChange: (e) => onChange(e.target.checked) }), label: `Item ${i}` }),
  openSel: "#dd [role=combobox]", optionSel: "li[data-value=v5]" });
