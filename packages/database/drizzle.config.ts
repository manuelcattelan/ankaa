import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import { defineConfig } from "drizzle-kit";
import * as Schema from "effect/Schema";

const databaseUrl = Schema.decodeUnknownSync(urlSchema)(
  process.env.DATABASE_URL_DIRECT,
);

export default defineConfig({
  dbCredentials: { url: databaseUrl },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema",
});
