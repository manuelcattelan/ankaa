import { defineConfig } from "vitest/config";

export const configuration = defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
