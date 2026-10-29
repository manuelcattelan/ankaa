import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  inferProcedureInput,
  inferTransformedProcedureOutput,
  TRPCMutationProcedure,
  TRPCQueryProcedure,
} from "@trpc/server";

import { ROUTINE_DELETE_WIRE_ERRORS } from "@ankaa/core/features/routine/errors/routine-delete-wire-errors";
import { ROUTINE_SAVE_WIRE_ERRORS } from "@ankaa/core/features/routine/errors/routine-save-wire-errors";
import { routineDeleteInputSchema } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";
import { routineSaveInputSchema } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";
import { WORKOUT_REMOVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-remove-set-wire-errors";
import { WORKOUT_SAVE_SET_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-save-set-wire-errors";
import { WORKOUT_START_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-start-wire-errors";
import { WORKOUT_STOP_WIRE_ERRORS } from "@ankaa/core/features/workout/errors/workout-stop-wire-errors";
import { workoutRemoveSetInputSchema } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import { workoutSaveSetInputSchema } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import { workoutStartInputSchema } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import { workoutStopInputSchema } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { makeTrpcClient } from "#/shared/services/make-trpc-client.ts";
import { TrpcClient } from "#/shared/services/trpc-client.ts";

/**
 * One fake procedure for each procedure of `AppRouter`, keyed by its path and
 * taking its input, so the fake router fails to type-check until it serves
 * every procedure and decodes each input as the server does.
 */
export type FakeTrpcProcedures = {
  [
    Path in keyof TrpcProcedures
  ]: TrpcProcedures[Path] extends AnyMutationProcedure
    ? TRPCMutationProcedure<FakeTrpcProcedureTypes<TrpcProcedures[Path]>>
    : TRPCQueryProcedure<FakeTrpcProcedureTypes<TrpcProcedures[Path]>>;
};

export type FakeTrpcResponses = {
  [Path in keyof TrpcProcedures]?: FakeTrpcResponse<TrpcProcedures[Path]>;
};

type FakeTrpcProcedureTypes<TProcedure extends AnyProcedure> = {
  input: inferProcedureInput<TProcedure>;
  meta: object;
  output: unknown;
};

type FakeTrpcResponse<TProcedure extends AnyProcedure> = (
  input: inferProcedureInput<TProcedure>,
) =>
  | FakeTrpcResponseOutput<TProcedure>
  | Promise<FakeTrpcResponseOutput<TProcedure>>;

type FakeTrpcResponseOutput<TProcedure extends AnyProcedure> = [
  inferTransformedProcedureOutput<AppRouter, TProcedure>,
] extends [never]
  ? undefined
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
 * The Wire errors of each procedure of `AppRouter`, keyed by its path, with
 * which the fake encodes a Wire error that a response throws, as the server
 * does.
 */
const FAKE_TRPC_WIRE_ERRORS: {
  [Path in keyof TrpcProcedures]: readonly Schema.Codec<unknown, unknown>[];
} = {
  "exercise.list": [],
  "routine.delete": ROUTINE_DELETE_WIRE_ERRORS,
  "routine.list": [],
  "routine.save": ROUTINE_SAVE_WIRE_ERRORS,
  "workout.findInProgress": [],
  "workout.removeSet": WORKOUT_REMOVE_SET_WIRE_ERRORS,
  "workout.saveSet": WORKOUT_SAVE_SET_WIRE_ERRORS,
  "workout.start": WORKOUT_START_WIRE_ERRORS,
  "workout.stop": WORKOUT_STOP_WIRE_ERRORS,
};

/**
 * Serves the real tRPC client from a fake router that answers each procedure
 * with its response in `responses`, and records the path of every procedure
 * the client calls into `receivedPaths`. A procedure with no response fails
 * with `NOT_FOUND`, a response fails by throwing a Wire error of its
 * procedure, and a call fails as on a device with no connection when
 * `isServerReachable` is `false`, or when its path is in `unreachablePaths`,
 * such as a Save made after the device lost its connection.
 */
export function fakeTrpcClientLayer({
  isServerReachable = true,
  receivedPaths = [],
  responses = {},
  unreachablePaths = [],
}: {
  isServerReachable?: boolean;
  receivedPaths?: string[];
  responses?: FakeTrpcResponses;
  unreachablePaths?: (keyof FakeTrpcResponses)[];
}) {
  return Layer.effect(
    TrpcClient,
    Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      const fakeTrpcRouter = createFakeTrpcRouter(responses);

      return TrpcClient.of(
        makeTrpcClient({
          authClient: authenticationClient.authClient,
          trpc: createTRPCClient<AppRouter>({
            links: [
              httpBatchLink({
                fetch: (url, options) => {
                  const fakeTrpcRequest = new Request(url, {
                    ...options,
                    signal: options?.signal ?? null,
                  });

                  const fakeTrpcRequestPaths =
                    getFakeTrpcRequestPaths(fakeTrpcRequest);

                  receivedPaths.push(...fakeTrpcRequestPaths);

                  if (
                    !isServerReachable ||
                    fakeTrpcRequestPaths.some((path) =>
                      unreachablePaths.some(
                        (unreachablePath) => unreachablePath === path,
                      ),
                    )
                  ) {
                    return Promise.reject(
                      new TypeError("Network request failed"),
                    );
                  }

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
        }),
      );
    }),
  );
}

function createFakeTrpcResolver<TProcedure extends AnyProcedure>({
  response,
}: {
  response: FakeTrpcResponse<TProcedure> | undefined;
}) {
  return async ({
    input,
    path,
  }: {
    input: inferProcedureInput<TProcedure>;
    path: string;
  }) => {
    if (response === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No fake response for "${path}"`,
      });
    }

    return await response(input);
  };
}

function createFakeTrpcRouter(fakeTrpcResponses: FakeTrpcResponses) {
  const t = initTRPC.create({
    errorFormatter: ({ error, path, shape }) => ({
      ...shape,
      data: {
        ...shape.data,
        wireError: encodeFakeWireError({ cause: error.cause, path }),
      },
    }),
  });

  const fakeTrpcProcedures: FakeTrpcProcedures = {
    "exercise.list": t.procedure.query(
      createFakeTrpcResolver({
        response: fakeTrpcResponses["exercise.list"],
      }),
    ),
    "routine.delete": t.procedure
      .input(Schema.toStandardSchemaV1(routineDeleteInputSchema))
      .mutation(
        createFakeTrpcResolver({
          response: fakeTrpcResponses["routine.delete"],
        }),
      ),
    "routine.list": t.procedure.query(
      createFakeTrpcResolver({
        response: fakeTrpcResponses["routine.list"],
      }),
    ),
    "routine.save": t.procedure
      .input(Schema.toStandardSchemaV1(routineSaveInputSchema))
      .mutation(
        createFakeTrpcResolver({
          response: fakeTrpcResponses["routine.save"],
        }),
      ),
    "workout.findInProgress": t.procedure.query(
      createFakeTrpcResolver({
        response: fakeTrpcResponses["workout.findInProgress"],
      }),
    ),
    "workout.removeSet": t.procedure
      .input(Schema.toStandardSchemaV1(workoutRemoveSetInputSchema))
      .mutation(
        createFakeTrpcResolver({
          response: fakeTrpcResponses["workout.removeSet"],
        }),
      ),
    "workout.saveSet": t.procedure
      .input(Schema.toStandardSchemaV1(workoutSaveSetInputSchema))
      .mutation(
        createFakeTrpcResolver({
          response: fakeTrpcResponses["workout.saveSet"],
        }),
      ),
    "workout.start": t.procedure
      .input(Schema.toStandardSchemaV1(workoutStartInputSchema))
      .mutation(
        createFakeTrpcResolver({
          response: fakeTrpcResponses["workout.start"],
        }),
      ),
    "workout.stop": t.procedure
      .input(Schema.toStandardSchemaV1(workoutStopInputSchema))
      .mutation(
        createFakeTrpcResolver({
          response: fakeTrpcResponses["workout.stop"],
        }),
      ),
  };

  return t.router(fakeTrpcProcedures);
}

function encodeFakeWireError({
  cause,
  path,
}: {
  cause: unknown;
  path: string | undefined;
}) {
  const wireErrorSchema = Schema.Union(
    Object.entries(FAKE_TRPC_WIRE_ERRORS).find(
      ([fakeTrpcPath]) => fakeTrpcPath === path,
    )?.[1] ?? [],
  );

  return Schema.is(wireErrorSchema)(cause)
    ? Schema.encodeUnknownSync(wireErrorSchema)(cause)
    : null;
}

function getFakeTrpcRequestPaths(fakeTrpcRequest: Request) {
  return new URL(fakeTrpcRequest.url).pathname.replace("/trpc/", "").split(",");
}
