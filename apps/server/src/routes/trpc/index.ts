import type { AppRouter } from "@ankaa/api";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync } from "fastify";

import { appRouter, createContext } from "@ankaa/api";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

export default (async (server) => {
  await server.register(fastifyTRPCPlugin, {
    trpcOptions: {
      createContext,
      onError: ({ error, path, req: request }) => {
        request.log.error(
          error,
          `Failed to handle tRPC request on path "${path}"`,
        );
      },
      router: appRouter,
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
}) satisfies FastifyPluginAsync;
