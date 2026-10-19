import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";

import { configuration } from "./index.ts";

export const databaseConfiguration = defineConfig(({ mode }) =>
  mergeConfig(configuration, {
    test: {
      env: loadEnv(mode, import.meta.dirname, ""),
      globalSetup: [path.join(import.meta.dirname, "postgres-global-setup.ts")],
    },
  }),
);
