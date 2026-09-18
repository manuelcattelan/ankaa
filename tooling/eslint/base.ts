import js from "@eslint/js";
import json from "@eslint/json";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export const baseConfig = defineConfig([
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      perfectionist.configs["recommended-natural"],
      eslintConfigPrettier,
    ],
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    extends: ["json/recommended"],
    files: ["**/*.json"],
    language: "json/json",
    plugins: { json },
    rules: {
      "json/sort-keys": [
        "error",
        "asc",
        { allowLineSeparatedGroups: true, natural: true },
      ],
    },
  },
  {
    extends: ["json/recommended"],
    files: ["**/tsconfig.json"],
    language: "json/jsonc",
    languageOptions: {
      allowTrailingCommas: true,
    },
    plugins: { json },
    rules: {
      "json/sort-keys": [
        "error",
        "asc",
        { allowLineSeparatedGroups: true, natural: true },
      ],
    },
  },
]);
