import type * as LogLevel from "effect/LogLevel";
import type { FastifyBaseLogger } from "fastify";

import * as Cause from "effect/Cause";
import * as Inspectable from "effect/Inspectable";
import * as Logger from "effect/Logger";
import * as References from "effect/References";

type PinoLogLevel = Exclude<keyof FastifyBaseLogger, "child" | "level">;

const PINO_LOG_LEVELS = {
  All: "trace",
  Debug: "debug",
  Error: "error",
  Fatal: "fatal",
  Info: "info",
  None: "silent",
  Trace: "trace",
  Warn: "warn",
} as const satisfies Record<LogLevel.LogLevel, PinoLogLevel>;

export function createLoggerLayer(serverLogger: FastifyBaseLogger) {
  return Logger.layer([
    Logger.make(({ cause, fiber, logLevel, message }) => {
      const messageParts: unknown[] = Array.isArray(message)
        ? message
        : [message];

      serverLogger[PINO_LOG_LEVELS[logLevel]](
        {
          ...fiber.getRef(References.CurrentLogAnnotations),
          ...(cause.reasons.length > 0 ? { err: Cause.squash(cause) } : {}),
        },
        messageParts
          .map((messagePart) =>
            typeof messagePart === "string"
              ? messagePart
              : Inspectable.toStringUnknown(messagePart),
          )
          .join(" "),
      );
    }),
  ]);
}
