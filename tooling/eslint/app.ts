import { baseConfig } from "@ankaa/eslint/base";
import expoConfig from "eslint-config-expo/flat";
import { defineConfig } from "eslint/config";

export const appConfig = defineConfig([
  baseConfig,
  {
    extends: [expoConfig],
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
  },
]);
