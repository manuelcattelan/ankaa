import { createServerConfiguration } from "@ankaa/eslint/create-server-configuration";
import { defineConfig } from "eslint/config";

export default defineConfig([
  createServerConfiguration({ basePath: import.meta.dirname }),
]);
