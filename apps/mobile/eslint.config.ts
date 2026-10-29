import { createMobileConfiguration } from "@ankaa/eslint/create-mobile-configuration";
import { defineConfig } from "eslint/config";

export default defineConfig([
  createMobileConfiguration({ basePath: import.meta.dirname }),
  { ignores: ["dist/*", "ios/*", "android/*", ".expo/*", "expo-env.d.ts"] },
]);
