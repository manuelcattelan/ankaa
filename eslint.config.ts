import { toolingConfiguration } from "@ankaa/eslint/tooling";
import { defineConfig } from "eslint/config";

export default defineConfig([
  toolingConfiguration,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  { ignores: ["apps/**", "packages/**", ".turbo/**", ".claude/worktrees/**"] },
]);
