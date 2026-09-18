import { mobileConfig } from "@ankaa/eslint/mobile";
import { defineConfig } from "eslint/config";

export default defineConfig([
  mobileConfig,
  { ignores: ["dist/*", "ios/*", "android/*", ".expo/*"] },
]);
