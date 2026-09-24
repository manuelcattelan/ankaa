import type { AppRouter } from "@ankaa/api";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";

import { appRouter, createContext } from "@ankaa/api";
import { auth } from "@ankaa/authentication";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { fromNodeHeaders } from "better-auth/node";
import fastify from "fastify";

import { environment } from "./environment.ts";

const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const ROUTER_MAXIMUM_PARAMETER_LENGTH = 5_000;

const AUTHENTICATION_FAILURE_MESSAGE =
  "Failed to handle authentication request";

const server = fastify({
  logger: true,
  routerOptions: { maxParamLength: ROUTER_MAXIMUM_PARAMETER_LENGTH },
});

await server.register(helmet);
await server.register(rateLimit);

server.setNotFoundHandler(
  { preHandler: server.rateLimit() },
  async (request, reply) => {
    const message = `Route "${request.method} ${request.url}" not found`;

    request.log.info(message);

    return reply.status(HTTP_STATUS_NOT_FOUND).send({
      error: "Not Found",
      message,
      statusCode: HTTP_STATUS_NOT_FOUND,
    });
  },
);

server.route({
  handler: async (request, reply) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const webRequest = new Request(url.toString(), {
        headers: fromNodeHeaders(request.headers),
        method: request.method,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(webRequest);

      reply.status(response.status);

      for (const [headerName, headerValue] of response.headers) {
        reply.header(headerName, headerValue);
      }

      return await reply.send(response.body ? await response.text() : null);
    } catch (error) {
      request.log.error(error, AUTHENTICATION_FAILURE_MESSAGE);

      return reply.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        code: "AUTHENTICATION_FAILURE",
        error: "Internal Server Error",
        message: AUTHENTICATION_FAILURE_MESSAGE,
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
      });
    }
  },
  method: ["GET", "POST"],
  url: "/api/auth/*",
});

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
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

try {
  await server.listen({
    host: environment.SERVER_HOST,
    port: environment.SERVER_PORT,
  });
} catch (error) {
  server.log.error(error, "Failed to start server");
  process.exit(1);
}
