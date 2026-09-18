import { createEnv } from "@ankaa/env";
import { z } from "zod";

export const env = createEnv({
  CLIENT_ORIGIN: z.url(),
  NODE_ENV: z.enum(["development", "production"]),
  NODE_PORT: z.coerce.number().int().min(1),
});
