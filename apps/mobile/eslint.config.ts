import { mobileConfiguration } from "@ankaa/eslint/mobile";
import { defineConfig } from "eslint/config";

export default defineConfig([
  mobileConfiguration,
  { ignores: ["dist/*", "ios/*", "android/*", ".expo/*", "expo-env.d.ts"] },
]);
