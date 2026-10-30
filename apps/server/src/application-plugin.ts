import type { ApplicationRuntime } from "@ankaa/api/trpc/context";
import type { FastifyError } from "fastify";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from "@ankaa/core/shared/constants/http-status-internal-server-error";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import underPressure from "@fastify/under-pressure";
import fastifyPlugin from "fastify-plugin";
import { STATUS_CODES } from "node:http";

import { getUrlPath } from "#/get-url-path.ts";
import { logRequestFailure } from "#/log-request-failure.ts";
import { authenticationRoute } from "#/routes/authentication-route.ts";
import { trpcRoute } from "#/routes/trpc-route.ts";
import { wellKnownRoute } from "#/routes/well-known-route.ts";

export type ApplicationPluginOptions = {
  androidAppPackageName: string;
  androidAppSha256CertificateFingerprints: readonly string[];
  appleAppBundleId: string;
  appleTeamId: string;
  runtime: ApplicationRuntime;
};

const HTTP_STATUS_NOT_FOUND = 404;

export const applicationPlugin = fastifyPlugin<ApplicationPluginOptions>(
  async (server, { runtime, ...wellKnownFileSettings }) => {
    await server.register(helmet);
    await server.register(rateLimit);
    await server.register(underPressure, { exposeStatusRoute: "/health" });

    server.setErrorHandler<FastifyError>(async (error, request, reply) => {
      const statusCode = error.statusCode ?? HTTP_STATUS_INTERNAL_SERVER_ERROR;
      const message = `Failed to handle request "${request.method} ${getUrlPath(request.url)}"`;

      logRequestFailure({ error, log: request.log, message, statusCode });

      if (statusCode < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
        return reply.send(error);
      }

      return reply.status(statusCode).send({
        error: STATUS_CODES[statusCode],
        message: STATUS_CODES[statusCode],
        statusCode,
      });
    });

    server.setNotFoundHandler(
      { preHandler: server.rateLimit() },
      async (request, reply) => {
        const message = `Route "${request.method} ${getUrlPath(request.url)}" not found`;

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
    await server.register(wellKnownRoute, {
      ...wellKnownFileSettings,
      prefix: "/.well-known",
    });
  },
);
