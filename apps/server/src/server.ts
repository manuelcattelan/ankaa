import type { NodeEnvironment } from "@ankaa/core/shared/constants/node-environments";
import type { FastifyRequest, FastifyServerOptions } from "fastify";

import { applicationLayer } from "@ankaa/api/application-layer";
import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environments";
import closeWithGrace from "close-with-grace";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Schema from "effect/Schema";
import fastify from "fastify";

import { applicationPlugin } from "#/application-plugin.ts";
import { createLoggerLayer } from "#/create-logger-layer.ts";
import { getUrlPath } from "#/get-url-path.ts";

// Fastify's own request serializer logs the whole URL with its query string
// (https://fastify.dev/docs/latest/Reference/Logging/#log-serializers), which
// can carry the token of an Account deletion link.
const LOGGER_SERIALIZERS = {
  req: (request: FastifyRequest) => ({
    host: request.host,
    method: request.method,
    remoteAddress: request.ip,
    url: getUrlPath(request.url),
  }),
};

const LOGGER_CONFIGURATIONS = {
  development: {
    serializers: LOGGER_SERIALIZERS,
    transport: {
      options: { ignore: "pid,hostname", translateTime: "HH:MM:ss Z" },
      target: "pino-pretty",
    },
  },
  production: { serializers: LOGGER_SERIALIZERS },
  test: false,
} satisfies Record<NodeEnvironment, FastifyServerOptions["logger"]>;

const ROUTER_MAXIMUM_PARAMETER_LENGTH = 5000;

const positiveIntegerSchema = Schema.Trim.pipe(
  Schema.decodeTo(Schema.FiniteFromString),
).check(Schema.isInt(), Schema.isGreaterThan(0));

const serverConfiguration = await Effect.runPromise(
  Config.all({
    androidAppPackageName: Config.NonEmptyString("ANDROID_APP_PACKAGE_NAME"),
    androidAppSha256CertificateFingerprints: Config.Array(
      Schema.NonEmptyString,
      "ANDROID_APP_SHA256_CERTIFICATE_FINGERPRINTS",
    ),
    appleAppBundleId: Config.NonEmptyString("APPLE_APP_BUNDLE_ID"),
    appleTeamId: Config.NonEmptyString("APPLE_TEAM_ID"),
    closeGraceDelayMilliseconds: Config.schema(
      positiveIntegerSchema,
      "CLOSE_GRACE_DELAY_MILLISECONDS",
    ),
    host: Config.NonEmptyString("SERVER_HOST"),
    nodeEnvironment: Config.Literals(NODE_ENVIRONMENTS, "NODE_ENV"),
    port: Config.schema(positiveIntegerSchema, "SERVER_PORT"),
  }),
);

const server = fastify({
  logger: LOGGER_CONFIGURATIONS[serverConfiguration.nodeEnvironment],
  routerOptions: { maxParamLength: ROUTER_MAXIMUM_PARAMETER_LENGTH },
});

const runtime = ManagedRuntime.make(
  applicationLayer.pipe(Layer.provideMerge(createLoggerLayer(server.log))),
);

async function exitAfterStartFailure(error: unknown) {
  server.log.error(error, "Failed to start server");
  await runtime.dispose();
  process.exit(1);
}

try {
  await runtime.context();
} catch (error) {
  await exitAfterStartFailure(error);
}

await server.register(applicationPlugin, {
  androidAppPackageName: serverConfiguration.androidAppPackageName,
  androidAppSha256CertificateFingerprints:
    serverConfiguration.androidAppSha256CertificateFingerprints,
  appleAppBundleId: serverConfiguration.appleAppBundleId,
  appleTeamId: serverConfiguration.appleTeamId,
  runtime,
});

server.addHook("onClose", async () => {
  await runtime.dispose();
});

closeWithGrace(
  {
    delay: serverConfiguration.closeGraceDelayMilliseconds,
    logger: server.log,
  },
  async ({ err }) => {
    if (err !== undefined) {
      server.log.error(err, "Closing server after an uncaught error");
    }

    await server.close();
  },
);

try {
  await server.listen({
    host: serverConfiguration.host,
    port: serverConfiguration.port,
  });
} catch (error) {
  await exitAfterStartFailure(error);
}
