import { h, rsetup } from "./rcommon.js";
import { Select, Checkbox } from "antd";
rsetup({ name: "Ant Design",
  Select: ({ options, value, onChange }) => h(Select, { options, value, onChange, placeholder: "Pick", style: { width: 200 } }),
  Checkbox: ({ i, checked, onChange }) => h(Checkbox, { checked, onChange: (e) => onChange(e.target.checked) }, `Item ${i}`),
  openSel: "#dd .ant-select", optionSel: '.ant-select-item-option[title="Option 5"]' });
