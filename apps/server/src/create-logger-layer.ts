import type { FastifyBaseLogger } from "fastify";

import { pinoBridge } from "@ankaa/api/shared/pino-bridge";
import { PinoLogger } from "@ankaa/api/shared/pino-logger";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as References from "effect/References";
import * as Schema from "effect/Schema";

const logLevelFromPinoLevelSchema = Schema.Literals([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]).transform(["Fatal", "Error", "Warn", "Info", "Debug", "Trace", "None"]);

export function createLoggerLayer(serverLogger: FastifyBaseLogger) {
  return Layer.mergeAll(
    Logger.layer([pinoBridge]),
    Layer.succeed(PinoLogger, serverLogger),
    Layer.effect(
      References.MinimumLogLevel,
      Schema.decodeUnknownEffect(logLevelFromPinoLevelSchema)(
        serverLogger.level,
      ),
    ),
  );
}
