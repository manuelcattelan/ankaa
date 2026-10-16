import type { FastifyBaseLogger } from "fastify";

import { Authentication } from "@ankaa/authentication";
import { Database } from "@ankaa/database";
import * as Layer from "effect/Layer";

import { createLoggerLayer } from "./logger.ts";

export function createApplicationLayer(serverLogger: FastifyBaseLogger) {
  return Layer.mergeAll(Authentication.layer, Database.layer).pipe(
    Layer.provideMerge(createLoggerLayer(serverLogger)),
  );
}
