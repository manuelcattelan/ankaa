import type { CurrentSession } from "@ankaa/authentication/current-session";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type * as Layer from "effect/Layer";
import type * as ManagedRuntime from "effect/ManagedRuntime";

import { Authentication } from "@ankaa/authentication";
import { fromNodeHeaders } from "better-auth/node";

import type { applicationLayer } from "../layer.ts";

export type ApplicationRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Success<typeof applicationLayer>,
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
