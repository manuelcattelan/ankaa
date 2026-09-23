import { createEnvironment } from "@ankaa/environment";
import { z } from "zod";

export const environment = createEnvironment({
  runtimeEnvironment: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
  shape: {
    EXPO_PUBLIC_API_URL: z
      .url()
      .refine(
        (url) => !url.endsWith("/"),
        "EXPO_PUBLIC_API_URL must not end with a slash",
      ),
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().min(1),
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().min(1),
  },
});
