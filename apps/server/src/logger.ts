import type * as LogLevel from "effect/LogLevel";
import type { FastifyBaseLogger } from "fastify";

import * as Cause from "effect/Cause";
import * as Inspectable from "effect/Inspectable";
import * as Logger from "effect/Logger";
import * as References from "effect/References";

export function createLoggerLayer(serverLogger: FastifyBaseLogger) {
  return Logger.layer([
    Logger.make(({ cause, fiber, logLevel, message }) => {
      const messageParts: unknown[] = Array.isArray(message)
        ? message
        : [message];

      serverLogger[getPinoLogLevel(logLevel)](
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

function getPinoLogLevel(logLevel: LogLevel.LogLevel) {
  switch (logLevel) {
    case "Debug": {
      return "debug";
    }

    case "Error": {
      return "error";
    }

    case "Fatal": {
      return "fatal";
    }

    case "Info": {
      return "info";
    }

    case "None": {
      return "silent";
    }

    case "Warn": {
      return "warn";
    }

    default: {
      return "trace";
    }
  }
}
