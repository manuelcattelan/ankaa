import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import { auth } from "@ankaa/authentication";
import { fromNodeHeaders } from "better-auth/node";

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function createContext({
  req: request,
  res: response,
}: CreateFastifyContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  return { request, response, session };
}
