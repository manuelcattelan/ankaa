import { createGeneratedFilesConfiguration } from "@ankaa/eslint/base";
import { packageConfiguration } from "@ankaa/eslint/package";
import { defineConfig } from "eslint/config";

export default defineConfig([
  packageConfiguration,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  createGeneratedFilesConfiguration({
    configuration: packageConfiguration,
    files: ["src/schema/authentication.ts"],
  }),
  { ignores: ["drizzle/**"] },
]);
