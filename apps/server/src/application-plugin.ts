import type { ApplicationRuntime } from "@ankaa/api/trpc/context";
import type { FastifyError } from "fastify";

import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import underPressure from "@fastify/under-pressure";
import fastifyPlugin from "fastify-plugin";
import { STATUS_CODES } from "node:http";

import { authenticationRoute } from "#/routes/authentication-route.ts";
import { trpcRoute } from "#/routes/trpc-route.ts";

export type ApplicationPluginOptions = {
  runtime: ApplicationRuntime;
};

const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export const applicationPlugin = fastifyPlugin<ApplicationPluginOptions>(
  async (server, { runtime }) => {
    await server.register(helmet);
    await server.register(rateLimit);
    await server.register(underPressure, { exposeStatusRoute: "/health" });

    server.setErrorHandler<FastifyError>(async (error, request, reply) => {
      const statusCode = error.statusCode ?? HTTP_STATUS_INTERNAL_SERVER_ERROR;
      const message = `Failed to handle request "${request.method} ${request.url}"`;

      if (statusCode < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
        request.log.info(error, message);

        return reply.send(error);
      }

      request.log.error(error, message);

      return reply.status(statusCode).send({
        error: STATUS_CODES[statusCode],
        message: STATUS_CODES[statusCode],
        statusCode,
      });
    });

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

    await server.register(authenticationRoute, {
      prefix: "/api/auth",
      runtime,
    });
    await server.register(trpcRoute, { prefix: "/trpc", runtime });
  },
);
