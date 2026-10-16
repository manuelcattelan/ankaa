import { packageConfiguration } from "@ankaa/eslint/package";
import { defineConfig } from "eslint/config";

export default defineConfig([
  packageConfiguration,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
]);
