import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import { auth } from "@ankaa/auth";
import { fromNodeHeaders } from "better-auth/node";

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return { req, res, session };
}
