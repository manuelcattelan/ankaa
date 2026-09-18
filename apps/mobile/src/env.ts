import { createEnv } from "@ankaa/env";
import { z } from "zod";

export const env = createEnv(
  {
    EXPO_PUBLIC_API_URL: z
      .url()
      .refine((url) => !url.endsWith("/"), "must not end with a slash"),
  },
  { EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL },
);
