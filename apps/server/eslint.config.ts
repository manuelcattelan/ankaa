import { apiConfig } from "@ankaa/eslint/api";
import { defineConfig } from "eslint/config";

export default defineConfig([
  apiConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
]);
