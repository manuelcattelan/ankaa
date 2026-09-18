import { appConfig } from "@ankaa/eslint/app";
import { defineConfig } from "eslint/config";

export default defineConfig([
  appConfig,
  { ignores: ["dist/*", "ios/*", "android/*", ".expo/*"] },
]);
