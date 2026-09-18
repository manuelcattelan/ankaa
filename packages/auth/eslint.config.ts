import { packageConfig } from "@ankaa/eslint/package";
import { defineConfig } from "eslint/config";

export default defineConfig([
  packageConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
]);
