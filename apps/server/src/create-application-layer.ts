import type { FastifyBaseLogger } from "fastify";

import { applicationLayer } from "@ankaa/api/application-layer";
import * as Layer from "effect/Layer";

import { createLoggerLayer } from "#/create-logger-layer.ts";

export function createApplicationLayer(serverLogger: FastifyBaseLogger) {
  return applicationLayer.pipe(
    Layer.provideMerge(createLoggerLayer(serverLogger)),
  );
}
