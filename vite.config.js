import { readdirSync } from "node:fs";
import { resolve } from "node:path";

// Every HTML file in the pages folder becomes a test page.
const pages = readdirSync(resolve(import.meta.dirname, "pages")).filter((file) => file.endsWith(".html"));

export default {
  build: {
    outDir: "dist",
    rollupOptions: {
      input: Object.fromEntries(pages.map((file) => [file.replace(".html", ""), resolve(import.meta.dirname, "pages", file)])),
      // React libraries mark files "use client", which doesn't apply here.
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
      },
    },
  },
};
