import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import * as Context from "effect/Context";
import { pino } from "pino";

/**
 * The pino logger that Effect's logs reach: `server.log` once the logger
 * Layer provides it, and `request.log` inside a request. It's silent by
 * default, so a Runtime without the logger Layer, such as a test's, logs
 * nothing.
 */
export const PinoLogger = Context.Reference<
  CreateFastifyContextOptions["req"]["log"]
>("@ankaa/api/shared/PinoLogger", {
  defaultValue: () => pino({ level: "silent" }),
});
