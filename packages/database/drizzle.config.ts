import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!URL.canParse(databaseUrl)) {
  throw new Error("DATABASE_URL must be a valid URL");
}

export default defineConfig({
  dbCredentials: { url: databaseUrl },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/index.ts",
});
