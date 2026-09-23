import { defineConfig } from "drizzle-kit";

import { environment } from "./src/environment.ts";

export default defineConfig({
  dbCredentials: { url: environment.DATABASE_URL },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/index.ts",
});
