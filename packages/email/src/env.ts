import { createEnv } from "@ankaa/env";
import { z } from "zod";

export const env = createEnv(
  {
    RESEND_API_KEY: z.string().min(1),
    RESEND_EMAIL_FROM: z.string().min(1),
  },
  process.env,
);
