import type { CurrentSession } from "@ankaa/authentication/current-session";
import type { Database } from "@ankaa/database";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type * as ManagedRuntime from "effect/ManagedRuntime";

import { Authentication } from "@ankaa/authentication";
import { fromNodeHeaders } from "better-auth/node";

export type ApplicationRuntime = ManagedRuntime.ManagedRuntime<
  Authentication | Database,
  unknown
>;

export type Context = ReturnType<typeof createInnerContext>;

type CreateContextOptions = CreateFastifyContextOptions & {
  runtime: ApplicationRuntime;
};

type CreateInnerContextOptions = {
  runtime: ApplicationRuntime;
  session: CurrentSession["Service"] | null;
};

export async function createContext({
  req: request,
  res: response,
  runtime,
}: CreateContextOptions) {
  const session = await runtime.runPromise(
    Authentication.use((authentication) =>
      authentication.getSession(fromNodeHeaders(request.headers)),
    ),
  );

  return { ...createInnerContext({ runtime, session }), request, response };
}

export function createInnerContext({
  runtime,
  session,
}: CreateInnerContextOptions) {
  return { runtime, session };
}
