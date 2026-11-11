import { readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

// Every folder in design-systems with an index.html becomes a test page.
const dir = resolve(import.meta.dirname, "design-systems");
const folders = readdirSync(dir).filter((name) => existsSync(resolve(dir, name, "index.html")));

export default {
  // shadcn/ui is styled with Tailwind, and its components are TypeScript files with JSX.
  plugins: [tailwindcss()],
  oxc: { jsx: { runtime: "automatic" } },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: Object.fromEntries(folders.map((name) => [name, resolve(dir, name, "index.html")])),
      // React libraries mark files "use client", which doesn't apply here.
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
      },
    },
  },
};
