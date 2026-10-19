import type { AppRouter } from "@ankaa/api/trpc/router";
import type { TRPCClient } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { routineDeleteInputSchema } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";
import { routineSaveInputSchema } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";
import { workoutSaveInputSchema } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { TrpcError } from "@/shared/errors/trpc-error";
import { AuthenticationClient } from "@/shared/services/authentication-client";

export type TrpcTestResponses = {
  [RouterName in keyof TrpcRouterOutputs]?: {
    [ProcedureName in keyof TrpcRouterOutputs[RouterName]]?: TrpcTestResponse<
      TrpcRouterInputs[RouterName][ProcedureName],
      TrpcRouterOutputs[RouterName][ProcedureName]
    >;
  };
};

type SendTrpcRequest<TData> = (
  vanillaTrpcClient: TRPCClient<AppRouter>,
) => Promise<TData>;

type TrpcRouterInputs = inferRouterInputs<AppRouter>;

type TrpcRouterOutputs = inferRouterOutputs<AppRouter>;

type TrpcTestRequest<TInput, TOutput> = {
  input: TInput;
  path: string;
  trpcTestResponse: TrpcTestResponse<TInput, TOutput> | undefined;
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

  static readonly layerTest = (trpcTestResponses: TrpcTestResponses) =>
    Layer.sync(this, () => {
      const trpcTestRouter = createTrpcTestRouter(trpcTestResponses);

      return this.of(
        createTrpcClientService(
          createTRPCClient<AppRouter>({
            links: [
              httpBatchLink({
                fetch: (url, options) =>
                  fetchRequestHandler({
                    endpoint: "/trpc",
                    req: new Request(url, options),
                    router: trpcTestRouter,
                  }),
                url: "https://api.ankaa.test/trpc",
              }),
            ],
          }),
        ),
      );
    });
}

async function answerTrpcTestRequest<TInput, TOutput>({
  input,
  path,
  trpcTestResponse,
}: TrpcTestRequest<TInput, TOutput>) {
  if (!trpcTestResponse) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `No test response for "${path}"`,
    });
  }

  return await trpcTestResponse(input);
}

function createTrpcClientService(vanillaTrpcClient: TRPCClient<AppRouter>) {
  function request<TData>(sendRequest: SendTrpcRequest<TData>) {
    return Effect.tryPromise({
      catch: (cause) => new TrpcError({ cause }),
      try: () => sendRequest(vanillaTrpcClient),
    });
  }

  return { request, vanillaTrpcClient };
}

function createTrpcTestRouter(trpcTestResponses: TrpcTestResponses) {
  const trpc = initTRPC.create();

  return trpc.router({
    exercise: trpc.router({
      list: trpc.procedure.query(({ path }) =>
        answerTrpcTestRequest({
          input: undefined,
          path,
          trpcTestResponse: trpcTestResponses.exercise?.list,
        }),
      ),
    }),
    routine: trpc.router({
      delete: trpc.procedure
        .input(Schema.toStandardSchemaV1(routineDeleteInputSchema))
        .mutation(({ input, path }) =>
          answerTrpcTestRequest({
            input,
            path,
            trpcTestResponse: trpcTestResponses.routine?.delete,
          }),
        ),
      list: trpc.procedure.query(({ path }) =>
        answerTrpcTestRequest({
          input: undefined,
          path,
          trpcTestResponse: trpcTestResponses.routine?.list,
        }),
      ),
      save: trpc.procedure
        .input(Schema.toStandardSchemaV1(routineSaveInputSchema))
        .mutation(({ input, path }) =>
          answerTrpcTestRequest({
            input,
            path,
            trpcTestResponse: trpcTestResponses.routine?.save,
          }),
        ),
    }),
    workout: trpc.router({
      save: trpc.procedure
        .input(Schema.toStandardSchemaV1(workoutSaveInputSchema))
        .mutation(({ input, path }) =>
          answerTrpcTestRequest({
            input,
            path,
            trpcTestResponse: trpcTestResponses.workout?.save,
          }),
        ),
    }),
  });
}
