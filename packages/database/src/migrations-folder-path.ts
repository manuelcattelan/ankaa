import { fileURLToPath } from "node:url";

export const migrationsFolderPath = fileURLToPath(
  new URL("../drizzle", import.meta.url),
);
