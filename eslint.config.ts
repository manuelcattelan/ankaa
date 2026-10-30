import { createToolingConfiguration } from "@ankaa/eslint/create-tooling-configuration";
import { defineConfig } from "eslint/config";

export default defineConfig([
  createToolingConfiguration({ basePath: import.meta.dirname }),
  { ignores: ["apps/**", "packages/**", ".turbo/**", ".claude/worktrees/**"] },
]);
