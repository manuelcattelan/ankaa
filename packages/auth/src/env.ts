import { createEnv } from "@ankaa/env";
import { z } from "zod";

export const env = createEnv(
  {
    APPLE_APP_BUNDLE_IDENTIFIER: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_IOS_CLIENT_ID: z.string().min(1),
    GOOGLE_WEB_CLIENT_ID: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]),
  },
  process.env,
);
