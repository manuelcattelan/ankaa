import type { AppRouter } from "@ankaa/api/trpc/router";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync } from "fastify";

import { createContext } from "@ankaa/api/trpc/context";
import { appRouter } from "@ankaa/api/trpc/router";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import type { ApplicationPluginOptions } from "../../application.ts";

export default (async (server, { runtime }) => {
  await server.register(fastifyTRPCPlugin, {
    trpcOptions: {
      createContext: (options) => createContext({ ...options, runtime }),
      onError: ({ error, path, req: request }) => {
        request.log.error(
          error,
          `Failed to handle tRPC request on path "${path}"`,
        );
      },
      router: appRouter,
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
}) satisfies FastifyPluginAsync<ApplicationPluginOptions>;
