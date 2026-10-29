import type { NodeEnvironment } from "@ankaa/core/shared/constants/node-environments";
import type { FastifyServerOptions } from "fastify";

import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environments";
import closeWithGrace from "close-with-grace";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Schema from "effect/Schema";
import fastify from "fastify";

import { applicationPlugin } from "#/application-plugin.ts";
import { createApplicationLayer } from "#/create-application-layer.ts";

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
    appleAppBundleIdentifier: Config.NonEmptyString(
      "APPLE_APP_BUNDLE_IDENTIFIER",
    ),
    appleTeamIdentifier: Config.NonEmptyString("APPLE_TEAM_IDENTIFIER"),
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

const applicationLayer = createApplicationLayer(server.log);

const runtime = ManagedRuntime.make(applicationLayer);

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
  appleAppBundleIdentifier: serverConfiguration.appleAppBundleIdentifier,
  appleTeamIdentifier: serverConfiguration.appleTeamIdentifier,
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
