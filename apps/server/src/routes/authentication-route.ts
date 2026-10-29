import type { FastifyPluginCallback } from "fastify";

import { PinoLogger } from "@ankaa/api/shared/pino-logger";
import { Authentication } from "@ankaa/authentication/authentication";
import { fromNodeHeaders } from "better-auth/node";
import * as Effect from "effect/Effect";

import type { ApplicationPluginOptions } from "#/application-plugin.ts";

export const authenticationRoute = ((server, { runtime }, done) => {
  server.route({
    config: { rateLimit: false },
    handler: async (request, reply) => {
      const url = new URL(
        request.url,
        `http://${String(request.headers.host)}`,
      );
      const webRequest = new Request(url.toString(), {
        // better-auth limits requests per client IP, read from this header
        // (https://www.better-auth.com/docs/concepts/rate-limit), so it must
        // hold the address Fastify trusts, never one the client sent.
        headers: fromNodeHeaders({
          ...request.headers,
          "x-forwarded-for": request.ip,
        }),
        method: request.method,
        ...(request.body === undefined || request.body === null
          ? {}
          : { body: JSON.stringify(request.body) }),
      });

      const response = await runtime.runPromise(
        Effect.gen(function* () {
          const authentication = yield* Authentication;

          return yield* authentication.handleRequest(webRequest);
        }).pipe(Effect.provideService(PinoLogger, request.log)),
      );

      void reply.status(response.status);

      for (const [headerName, headerValue] of response.headers) {
        void reply.header(headerName, headerValue);
      }

      if (response.body === null) {
        return reply.send();
      }

      return reply.send(await response.text());
    },
    method: ["GET", "POST"],
    url: "/*",
  });

  done();
}) satisfies FastifyPluginCallback<ApplicationPluginOptions>;
