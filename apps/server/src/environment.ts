import { createEnvironment, nodeEnvironmentSchema } from "@ankaa/environment";
import { z } from "zod";

export const environment = createEnvironment({
  runtimeEnvironment: process.env,
  shape: {
    CLOSE_GRACE_DELAY_MILLISECONDS: z.coerce.number().int().positive(),
    NODE_ENV: nodeEnvironmentSchema,
    SERVER_HOST: z.string().nonempty(),
    SERVER_PORT: z.coerce.number().int().positive(),
  },
});
