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
    APP_SCHEME: z.string(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    PROCESS_ENV: z.string(),
  })
  .parse(process.env);
