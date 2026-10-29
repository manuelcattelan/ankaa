import type { AppRouter } from "@ankaa/api/trpc/router";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync } from "fastify";

import { createContext } from "@ankaa/api/trpc/context";
import { appRouter } from "@ankaa/api/trpc/router";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

import type { ApplicationPluginOptions } from "../../application.ts";

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export default (async (server, { runtime }) => {
  await server.register(fastifyTRPCPlugin, {
    trpcOptions: {
      createContext: (options) => createContext({ ...options, runtime }),
      onError: ({ error, path, req: request }) => {
        const message = `Failed to handle tRPC request on path "${path}"`;

        if (
          getHTTPStatusCodeFromError(error) < HTTP_STATUS_INTERNAL_SERVER_ERROR
        ) {
          request.log.info(error, message);

          return;
        }

        request.log.error(error, message);
      },
      router: appRouter,
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
}) satisfies FastifyPluginAsync<ApplicationPluginOptions>;
