import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { ApplicationRuntime } from "@ankaa/api/trpc/context";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync } from "fastify";

import { appRouter } from "@ankaa/api/trpc/app-router";
import { createContext } from "@ankaa/api/trpc/context";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

import { logRequestFailure } from "#/log-request-failure.ts";

type TrpcRouteOptions = { runtime: ApplicationRuntime };

export const trpcRoute = (async (server, { runtime }) => {
  await server.register(fastifyTRPCPlugin, {
    trpcOptions: {
      createContext: (options) => createContext({ ...options, runtime }),
      onError: ({ error, path, req }) => {
        logRequestFailure({
          error,
          log: req.log,
          message: `Failed to handle tRPC request on path "${String(path)}"`,
          statusCode: getHTTPStatusCodeFromError(error),
        });
      },
      router: appRouter,
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
}) satisfies FastifyPluginAsync<TrpcRouteOptions>;
