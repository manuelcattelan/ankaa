import { defineConfig } from "eslint/config";
import globals from "globals";

import {
  baseConfiguration,
  JAVASCRIPT_FILES,
  vitestConfiguration,
} from "./base.ts";

export const serverConfiguration = defineConfig([
  baseConfiguration,
  vitestConfiguration,
  {
    files: JAVASCRIPT_FILES,
    languageOptions: { globals: globals.node },
    rules: { "no-console": "error" },
  },
  {
    files: ["src/plugins/**", "src/routes/**"],
    rules: { "import-x/no-default-export": "off" },
  },
]);
