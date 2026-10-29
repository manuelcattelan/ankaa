import { createPackageConfiguration } from "@ankaa/eslint/create-package-configuration";
import { defineConfig } from "eslint/config";

export default defineConfig([
  createPackageConfiguration({ basePath: import.meta.dirname }),
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  { ignores: ["drizzle/**"] },
]);
