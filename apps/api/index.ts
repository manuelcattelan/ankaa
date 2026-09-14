import { type AppRouter, appRouter, createContext } from "@ankaa/api";
import { auth } from "@ankaa/auth";
import fastifyCors from "@fastify/cors";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { fromNodeHeaders } from "better-auth/node";
import Fastify from "fastify";

import { env } from "./env.ts";

const fastify = Fastify({
  logger: true,
  routerOptions: {
    maxParamLength: 5000,
  },
});

// Configure CORS policies
fastify.register(fastifyCors, {
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
});

// Register authentication endpoint
fastify.route({
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = fromNodeHeaders(request.headers);

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        headers,
        method: request.method,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      // Process authentication request
      const response = await auth.handler(req);

      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      fastify.log.error(error, "Authentication Error:");
      return reply.status(500).send({
        code: "AUTH_FAILURE",
        error: "Internal authentication error",
      });
    }
  },
  method: ["GET", "POST"],
  url: "/api/auth/*",
});

fastify.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    createContext,
    onError({ error, path }) {
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
    router: appRouter,
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

// Initialize server
fastify.listen({ port: env.NODE_PORT }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on port ${env.NODE_PORT}`);
});
