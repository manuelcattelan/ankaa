import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync } from "fastify";

import { appRouter } from "@ankaa/api/trpc/app-router";
import { createContext } from "@ankaa/api/trpc/context";
import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from "@ankaa/core/shared/constants/http-status-internal-server-error";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

import type { ApplicationPluginOptions } from "#/application-plugin.ts";

export const trpcRoute = (async (server, { runtime }) => {
  await server.register(fastifyTRPCPlugin, {
    trpcOptions: {
      createContext: (options) => createContext({ ...options, runtime }),
      onError: ({ error, path, req }) => {
        const message = `Failed to handle tRPC request on path "${String(path)}"`;

        if (
          getHTTPStatusCodeFromError(error) < HTTP_STATUS_INTERNAL_SERVER_ERROR
        ) {
          req.log.info(error, message);

          return;
        }

        req.log.error(error, message);
      },
      router: appRouter,
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
}) satisfies FastifyPluginAsync<ApplicationPluginOptions>;
