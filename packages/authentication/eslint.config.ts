import { PREVENT_ABBREVIATIONS_OPTIONS } from "@ankaa/eslint/base";
import { packageConfiguration } from "@ankaa/eslint/package";
import { defineConfig } from "eslint/config";

export default defineConfig([
  packageConfiguration,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ["src/authentication.ts"],
    rules: {
      "unicorn/prevent-abbreviations": [
        "error",
        { ...PREVENT_ABBREVIATIONS_OPTIONS, allowList: { auth: true } },
      ],
    },
  },
]);
