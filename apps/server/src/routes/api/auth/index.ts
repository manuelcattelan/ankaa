import type { FastifyPluginCallback } from "fastify";

import { auth } from "@ankaa/authentication";
import { fromNodeHeaders } from "better-auth/node";

export default ((server, options, done) => {
  server.route({
    handler: async (request, reply) => {
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

      return reply.send(response.body ? await response.text() : null);
    },
    method: ["GET", "POST"],
    url: "/*",
  });

  done();
}) satisfies FastifyPluginCallback;
