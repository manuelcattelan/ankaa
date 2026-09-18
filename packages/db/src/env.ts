import { createEnv } from "@ankaa/env";
import { z } from "zod";

export const env = createEnv({
  DATABASE_URL: z.url(),
});
