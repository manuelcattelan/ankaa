import { serverConfiguration } from "@ankaa/eslint/server";
import { defineConfig } from "eslint/config";

export default defineConfig([
  serverConfiguration,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
]);
