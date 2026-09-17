import { defineConfig } from "drizzle-kit";

import { env } from "./src/env.ts";

export default defineConfig({
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/index.ts",
});
