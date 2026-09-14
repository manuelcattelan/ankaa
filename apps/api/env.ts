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
    CLIENT_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production"]),
    NODE_PORT: z.coerce.number().int().min(1),
  })
  .parse(process.env);
