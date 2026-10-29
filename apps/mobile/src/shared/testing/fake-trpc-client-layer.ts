import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  inferProcedureInput,
  inferTransformedProcedureOutput,
} from "@trpc/server";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { makeTrpcClient } from "#/shared/services/make-trpc-client.ts";
import { TrpcClient } from "#/shared/services/trpc-client.ts";

/**
 * One fake procedure for each procedure of `AppRouter`, keyed by its path,
 * so the fake router fails to type-check until it serves every procedure.
 */
export type FakeTrpcProcedures = {
  [
    Path in keyof TrpcProcedures
  ]: TrpcProcedures[Path] extends AnyMutationProcedure
    ? AnyMutationProcedure
    : AnyQueryProcedure;
};

export type FakeTrpcResponses = {
  [Path in keyof TrpcProcedures]?: FakeTrpcResponse<TrpcProcedures[Path]>;
};

type CreateFakeTrpcResolverOptions<TProcedure extends AnyProcedure> = {
  fakeTrpcResponse: FakeTrpcResponse<TProcedure> | undefined;
};

type FakeTrpcClientLayerOptions = {
  fakeTrpcResponses?: FakeTrpcResponses;
  receivedTrpcPaths?: string[];
};

type FakeTrpcResolverOptions<TProcedure extends AnyProcedure> = {
  input: inferProcedureInput<TProcedure>;
  path: string;
};

type FakeTrpcResponse<TProcedure extends AnyProcedure> = (
  input: inferProcedureInput<TProcedure>,
) =>
  | FakeTrpcResponseOutput<TProcedure>
  | Promise<FakeTrpcResponseOutput<TProcedure>>;

type FakeTrpcResponseOutput<TProcedure extends AnyProcedure> = [
  inferTransformedProcedureOutput<AppRouter, TProcedure>,
] extends [never]
  ? void
  : inferTransformedProcedureOutput<AppRouter, TProcedure>;

type TrpcProcedureEntry<TRouterRecord, TPathPrefix extends string> = {
  [Key in keyof TRouterRecord & string]: TRouterRecord[Key] extends AnyProcedure
    ? { path: `${TPathPrefix}${Key}`; procedure: TRouterRecord[Key] }
    : TrpcProcedureEntry<TRouterRecord[Key], `${TPathPrefix}${Key}.`>;
}[keyof TRouterRecord & string];

type TrpcProcedures = {
  [
    TrpcProcedure in TrpcProcedureEntry<
      AppRouter["_def"]["record"],
      ""
    > as TrpcProcedure["path"]
  ]: TrpcProcedure["procedure"];
};

/**
 * Serves the real tRPC client from a fake router that answers each procedure
 * with its response in `fakeTrpcResponses`, and records the path of every
 * procedure the client calls into `receivedTrpcPaths`. A procedure with no
 * response fails with `NOT_FOUND`.
 */
export function fakeTrpcClientLayer({
  fakeTrpcResponses = {},
  receivedTrpcPaths = [],
}: FakeTrpcClientLayerOptions) {
  return Layer.effect(
    TrpcClient,
    Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      const fakeTrpcRouter = createFakeTrpcRouter(fakeTrpcResponses);

      return TrpcClient.of(
        makeTrpcClient(
          createTRPCClient<AppRouter>({
            links: [
              httpBatchLink({
                fetch: (url, options) => {
                  const fakeTrpcRequest = new Request(url, options);

                  receivedTrpcPaths.push(
                    ...getFakeTrpcRequestPaths(fakeTrpcRequest),
                  );

                  return fetchRequestHandler({
                    endpoint: "/trpc",
                    req: fakeTrpcRequest,
                    router: fakeTrpcRouter,
                  });
                },
                url: `${authenticationClient.apiUrl}/trpc`,
              }),
            ],
          }),
        ),
      );
    }),
  );
}

function createFakeTrpcResolver<TProcedure extends AnyProcedure>({
  fakeTrpcResponse,
}: CreateFakeTrpcResolverOptions<TProcedure>) {
  return async ({ input, path }: FakeTrpcResolverOptions<TProcedure>) => {
    if (!fakeTrpcResponse) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No fake response for "${path}"`,
      });
    }

    return await fakeTrpcResponse(input);
  };
}

function createFakeTrpcRouter(fakeTrpcResponses: FakeTrpcResponses) {
  const trpc = initTRPC.create();

  const fakeTrpcProcedures: FakeTrpcProcedures = {
    "exercise.list": trpc.procedure.query(
      createFakeTrpcResolver({
        fakeTrpcResponse: fakeTrpcResponses["exercise.list"],
      }),
    ),
  };

  return trpc.router(fakeTrpcProcedures);
}

function getFakeTrpcRequestPaths(fakeTrpcRequest: Request) {
  return new URL(fakeTrpcRequest.url).pathname.replace("/trpc/", "").split(",");
}
