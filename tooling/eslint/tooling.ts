import { defineConfig } from "eslint/config";
import globals from "globals";

import { baseConfiguration, JAVASCRIPT_FILES } from "./base.ts";

export const toolingConfiguration = defineConfig([
  baseConfiguration,
  { files: JAVASCRIPT_FILES, languageOptions: { globals: globals.node } },
]);
