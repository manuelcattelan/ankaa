import type { FastifyBaseLogger } from "fastify";

import { applicationLayer } from "@ankaa/api/layer";
import * as Layer from "effect/Layer";

import { createLoggerLayer } from "#/logger.ts";

export function createApplicationLayer(serverLogger: FastifyBaseLogger) {
  return applicationLayer.pipe(
    Layer.provideMerge(createLoggerLayer(serverLogger)),
  );
}
