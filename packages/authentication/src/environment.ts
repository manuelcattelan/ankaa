import { createEnvironment, nodeEnvironmentSchema } from "@ankaa/environment";
import { z } from "zod";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const environment = createEnvironment({
  runtimeEnvironment: process.env,
  shape: {
    APPLE_APP_BUNDLE_IDENTIFIER: z.string().nonempty(),
    BETTER_AUTH_SECRET: z.string().min(BETTER_AUTH_SECRET_MINIMUM_LENGTH),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_IOS_CLIENT_ID: z.string().nonempty(),
    GOOGLE_WEB_CLIENT_ID: z.string().nonempty(),
    NODE_ENV: nodeEnvironmentSchema,
  },
});
