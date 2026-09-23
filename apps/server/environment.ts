import { createEnvironment } from "@ankaa/environment";
import { z } from "zod";

export const environment = createEnvironment({
  runtimeEnvironment: process.env,
  shape: {
    NODE_ENV: z.enum(["development", "production"]),
    SERVER_HOST: z.string().min(1),
    SERVER_PORT: z.coerce.number().int().min(1),
  },
});
