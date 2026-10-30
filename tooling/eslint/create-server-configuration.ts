import { defineConfig } from "eslint/config";
import globals from "globals";

import {
  baseConfiguration,
  JAVASCRIPT_FILES,
  vitestConfiguration,
} from "#/base.ts";

export function createServerConfiguration({ basePath }: { basePath: string }) {
  return defineConfig([
    baseConfiguration,
    vitestConfiguration,
    {
      files: JAVASCRIPT_FILES,
      languageOptions: {
        globals: globals.node,
        parserOptions: { tsconfigRootDir: basePath },
      },
      rules: { "no-console": "error" },
    },
  ]);
}
