import { createEnv } from "@ankaa/env";
import { z } from "zod";

export const env = createEnv({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  NODE_ENV: z.enum(["development", "production"]),
});
