import type { NodeEnvironment } from "@ankaa/core/shared/constants/node-environment";
import type { FastifyServerOptions } from "fastify";

import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environment";
import closeWithGrace from "close-with-grace";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Schema from "effect/Schema";
import fastify from "fastify";

import { applicationPlugin } from "./application.ts";
import { createApplicationLayer } from "./layer.ts";

const LOGGER_CONFIGURATIONS = {
  development: {
    transport: {
      options: { ignore: "pid,hostname", translateTime: "HH:MM:ss Z" },
      target: "pino-pretty",
    },
  },
  production: true,
  test: false,
} satisfies Record<NodeEnvironment, FastifyServerOptions["logger"]>;

const ROUTER_MAXIMUM_PARAMETER_LENGTH = 5_000;

const positiveIntegerSchema = Schema.Trim.pipe(
  Schema.decodeTo(Schema.FiniteFromString),
).check(Schema.isInt(), Schema.isGreaterThan(0));

const serverConfiguration = await Effect.runPromise(
  Config.all({
    closeGraceDelayMilliseconds: Config.schema(
      positiveIntegerSchema,
      "CLOSE_GRACE_DELAY_MILLISECONDS",
    ),
    nodeEnvironment: Config.Literals(NODE_ENVIRONMENTS, "NODE_ENV"),
    serverHost: Config.NonEmptyString("SERVER_HOST"),
    serverPort: Config.schema(positiveIntegerSchema, "SERVER_PORT"),
  }),
);

const server = fastify({
  logger: LOGGER_CONFIGURATIONS[serverConfiguration.nodeEnvironment],
  routerOptions: { maxParamLength: ROUTER_MAXIMUM_PARAMETER_LENGTH },
});

const applicationLayer = createApplicationLayer(server.log);

const runtime = ManagedRuntime.make(applicationLayer);

function exitAfterStartFailure(error: unknown) {
  server.log.error(error, "Failed to start server");
  process.exit(1);
}

try {
  await runtime.context();
} catch (error) {
  exitAfterStartFailure(error);
}

await server.register(applicationPlugin, { runtime });

server.addHook("onClose", async () => {
  await runtime.dispose();
});

closeWithGrace(
  {
    delay: serverConfiguration.closeGraceDelayMilliseconds,
    logger: server.log,
  },
  async ({ err: error }) => {
    if (error) {
      server.log.error(error, "Closing server after an uncaught error");
    }

    await server.close();
  },
);

try {
  await server.listen({
    host: serverConfiguration.serverHost,
    port: serverConfiguration.serverPort,
  });
} catch (error) {
  exitAfterStartFailure(error);
}
