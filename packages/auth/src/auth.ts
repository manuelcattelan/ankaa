import { db } from "@ankaa/db";
import * as schema from "@ankaa/db/schema";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";

import { env } from "./env.ts";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema, schemaName: "auth" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [expo()],
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "mobile://",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
});
