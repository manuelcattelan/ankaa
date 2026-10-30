import { configuration } from "@ankaa/vitest/configuration";
import path from "node:path";
import { mergeConfig } from "vitest/config";

export const databaseConfiguration = mergeConfig(configuration, {
  test: { globalSetup: [path.join(import.meta.dirname, "setup.ts")] },
});
