import { defineConfig } from "eslint/config";
import globals from "globals";

import { baseConfiguration, JAVASCRIPT_FILES } from "#/base.ts";

export function createToolingConfiguration({ basePath }: { basePath: string }) {
  return defineConfig([
    baseConfiguration,
    {
      files: JAVASCRIPT_FILES,
      languageOptions: {
        globals: globals.node,
        parserOptions: { tsconfigRootDir: basePath },
      },
    },
  ]);
}
