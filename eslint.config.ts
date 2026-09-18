import { toolingConfig } from "@ankaa/eslint/tooling";
import { defineConfig } from "eslint/config";

export default defineConfig([
  toolingConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  { ignores: ["apps/**", "packages/**", ".turbo/**"] },
]);
