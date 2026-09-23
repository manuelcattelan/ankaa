import { createEnvironment } from "@ankaa/environment";
import { z } from "zod";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const environment = createEnvironment({
  runtimeEnvironment: process.env,
  shape: {
    APPLE_APP_BUNDLE_IDENTIFIER: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(BETTER_AUTH_SECRET_MINIMUM_LENGTH),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_IOS_CLIENT_ID: z.string().min(1),
    GOOGLE_WEB_CLIENT_ID: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]),
  },
});
