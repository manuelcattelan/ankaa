import { defineConfig } from "eslint/config";
import globals from "globals";

import { baseConfiguration, JAVASCRIPT_FILES } from "./base.ts";

export const serverConfiguration = defineConfig([
  baseConfiguration,
  {
    files: JAVASCRIPT_FILES,
    languageOptions: { globals: globals.node },
    rules: { "no-console": "error" },
  },
]);
