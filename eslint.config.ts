import { toolingConfig } from "@ankaa/eslint/tooling";
import { defineConfig } from "eslint/config";

export default defineConfig([
  toolingConfig,
  { ignores: ["apps/**", "packages/**", ".turbo/**"] },
]);
