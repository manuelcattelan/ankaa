import { createEnvironment } from "@ankaa/environment";
import { z } from "zod";

export const environment = createEnvironment({
  runtimeEnvironment: process.env,
  shape: { DATABASE_URL: z.url() },
});
