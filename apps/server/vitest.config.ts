import { configuration } from "@ankaa/vitest";
import { loadEnv } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";

export default defineConfig(({ mode }) =>
  mergeConfig(configuration, {
    test: {
      env: loadEnv(mode, process.cwd(), ""),
      globalSetup: ["@ankaa/vitest/postgres-global-setup"],
    },
  }),
);
