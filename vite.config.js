import { resolve } from "node:path";

const pages = [
  "react-mantine", "react-antd", "react-mui", "react-spectrum",
  "wc-carbon", "wc-fluent", "wc-webawesome", "wc-ui5", "wc-spectrum", "wc-ionic",
];

export default {
  build: {
    outDir: "dist",
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `pages/${p}.html`)])),
      // React libraries mark files "use client", which doesn't apply here.
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
      },
    },
  },
};
