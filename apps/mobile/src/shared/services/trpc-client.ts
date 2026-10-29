import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { TRPCClient } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type * as Schema from "effect/Schema";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { TrpcError } from "#/shared/errors/trpc-error.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export type TrpcTestResponses = {
  [RouterName in keyof TrpcRouterOutputs]?: {
    [ProcedureName in keyof TrpcRouterOutputs[RouterName]]?: TrpcTestResponse<
      TrpcRouterInputs[RouterName][ProcedureName],
      TrpcRouterOutputs[RouterName][ProcedureName]
    >;
  };
};

type TrpcRequest<TData> = {
  call: (callOptions: {
    signal: AbortSignal;
    vanillaTrpcClient: TRPCClient<AppRouter>;
  }) => Promise<TData>;
  errors: readonly Schema.Top[];
};

type TrpcRouterInputs = inferRouterInputs<AppRouter>;

type TrpcRouterOutputs = inferRouterOutputs<AppRouter>;

type TrpcTestResolverOptions<TInput> = {
  input: TInput;
  path: string;
};

type TrpcTestResponse<TInput, TOutput> = (
  input: TInput,
) => Promise<TrpcTestResponseOutput<TOutput>> | TrpcTestResponseOutput<TOutput>;

type TrpcTestResponseOutput<TOutput> = [TOutput] extends [never]
  ? void
  : TOutput;

export class TrpcClient extends Context.Service<TrpcClient>()(
  "@ankaa/mobile/shared/services/TrpcClient",
  {
    make: Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      return createTrpcClientService(
        createTRPCClient<AppRouter>({
          links: [
            httpBatchLink({
              fetch: (url, options) =>
                fetch(url, { ...options, credentials: "omit" }),
              headers: async () => {
                const cookies =
                  await authenticationClient.betterAuthenticationClient.getCookie();

                return cookies ? { cookie: cookies } : {};
              },
              url: `${authenticationClient.apiUrl}/trpc`,
            }),
          ],
        }),
      );
    }),
  },
) {
  static readonly layerNoDeps = Layer.effect(this, this.make);

  static readonly layer = this.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );

  static readonly layerTest = (
    trpcTestResponses: TrpcTestResponses,
    receivedTrpcPaths: string[] = [],
  ) =>
    Layer.effect(
      this,
      Effect.gen(function* () {
        const authenticationClient = yield* AuthenticationClient;

        const trpcTestRouter = createTrpcTestRouter(trpcTestResponses);

        return createTrpcClientService(
          createTRPCClient<AppRouter>({
            links: [
              httpBatchLink({
                fetch: (url, options) => {
                  const trpcTestRequest = new Request(url, options);

                  receivedTrpcPaths.push(
                    ...getTrpcTestRequestPaths(trpcTestRequest),
                  );

                  return fetchRequestHandler({
                    endpoint: "/trpc",
                    req: trpcTestRequest,
                    router: trpcTestRouter,
                  });
                },
                url: `${authenticationClient.apiUrl}/trpc`,
              }),
            ],
          }),
        );
      }),
    );
}

function createTrpcClientService(vanillaTrpcClient: TRPCClient<AppRouter>) {
  function request<TData>({ call }: TrpcRequest<TData>) {
    return Effect.tryPromise({
      catch: (cause) => new TrpcError({ cause }),
      try: (signal) => call({ signal, vanillaTrpcClient }),
    });
  }

  return { request, vanillaTrpcClient };
}

function createTrpcTestResolver<TInput, TOutput>(
  trpcTestResponse: TrpcTestResponse<TInput, TOutput> | undefined,
) {
  return async ({ input, path }: TrpcTestResolverOptions<TInput>) => {
    if (!trpcTestResponse) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No test response for "${path}"`,
      });
    }

    return await trpcTestResponse(input);
  };
}

function createTrpcTestRouter(trpcTestResponses: TrpcTestResponses) {
  const trpc = initTRPC.create();

  return trpc.router({
    exercise: trpc.router({
      list: trpc.procedure.query(
        createTrpcTestResolver(trpcTestResponses.exercise?.list),
      ),
    }),
  });
}

function getTrpcTestRequestPaths(trpcTestRequest: Request) {
  return new URL(trpcTestRequest.url).pathname.replace("/trpc/", "").split(",");
}
