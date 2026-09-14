import { z } from "zod";

try {
  process.loadEnvFile();
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
    throw error;
  }
}

export const env = z
  .object({
    PORT: z.coerce.number(),
  })
  .parse(process.env);
