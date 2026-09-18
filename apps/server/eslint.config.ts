import { serverConfig } from "@ankaa/eslint/server";
import { defineConfig } from "eslint/config";

export default defineConfig([
  serverConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
]);
