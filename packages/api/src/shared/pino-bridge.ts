import type * as LogLevel from "effect/LogLevel";

import * as Cause from "effect/Cause";
import * as Inspectable from "effect/Inspectable";
import * as Logger from "effect/Logger";
import * as Predicate from "effect/Predicate";
import * as Record from "effect/Record";

import { PinoLogger } from "#/shared/pino-logger.ts";

const PINO_LOG_LEVELS = {
  All: "trace",
  Debug: "debug",
  Error: "error",
  Fatal: "fatal",
  Info: "info",
  None: "silent",
  Trace: "trace",
  Warn: "warn",
} as const satisfies Record<LogLevel.LogLevel, string>;

/**
 * The Effect logger that writes every Effect log to the pino logger of the
 * fiber's `PinoLogger`, because Effect ships no pino integration
 * (https://github.com/manuelcattelan/ankaa/issues/86). The
 * annotations and the spans become fields, the `Error` parts of the message
 * and every error of the cause become `err`, and the other parts become `msg`.
 */
export const pinoBridge = Logger.make((options) => {
  const structuredLog = Logger.formatStructured.log(options);
  const messageParts: unknown[] = Array.isArray(structuredLog.message)
    ? structuredLog.message
    : [structuredLog.message];
  const errors = [
    ...messageParts.filter(Predicate.isError),
    ...Cause.prettyErrors(options.cause),
  ];

  options.fiber.getRef(PinoLogger)[PINO_LOG_LEVELS[options.logLevel]](
    {
      ...structuredLog.annotations,
      ...(Record.isEmptyRecord(structuredLog.spans)
        ? {}
        : { spans: structuredLog.spans }),
      ...(errors.length === 0
        ? {}
        : {
            err: errors.length === 1 ? errors[0] : new AggregateError(errors),
          }),
    },
    messageParts
      .filter((messagePart) => !Predicate.isError(messagePart))
      .map((messagePart) =>
        Predicate.isString(messagePart)
          ? messagePart
          : Inspectable.toStringUnknown(messagePart),
      )
      .join(" "),
  );
});
