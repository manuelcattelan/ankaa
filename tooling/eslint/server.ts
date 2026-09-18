import { baseConfig } from "@ankaa/eslint/base";
import { defineConfig } from "eslint/config";
import globals from "globals";

export const serverConfig = defineConfig([
  baseConfig,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    languageOptions: { globals: globals.node },
  },
]);
