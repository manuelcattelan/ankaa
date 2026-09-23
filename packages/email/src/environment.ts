import { createEnvironment } from "@ankaa/environment";
import { z } from "zod";

export const environment = createEnvironment({
  runtimeEnvironment: process.env,
  shape: {
    RESEND_API_KEY: z.string().min(1),
    RESEND_EMAIL_FROM: z.string().min(1),
  },
});
