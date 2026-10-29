import type { FastifyPluginCallback } from "fastify";

import { PinoLogger } from "@ankaa/api/shared/pino-logger";
import { Authentication } from "@ankaa/authentication/authentication";
import { fromNodeHeaders } from "better-auth/node";
import * as Effect from "effect/Effect";

import type { ApplicationPluginOptions } from "#/application-plugin.ts";

export const authenticationRoute = ((server, { runtime }, done) => {
  server.route({
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const webRequest = new Request(url.toString(), {
        headers: fromNodeHeaders(request.headers),
        method: request.method,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
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

      return reply.send(response.body ? await response.text() : undefined);
    },
    method: ["GET", "POST"],
    url: "/*",
  });

  done();
}) satisfies FastifyPluginCallback<ApplicationPluginOptions>;
