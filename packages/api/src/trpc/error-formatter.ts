import type { TRPCDefaultErrorShape, TRPCError } from "@trpc/server";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from "@ankaa/core/shared/constants/http-status-internal-server-error";
import * as Schema from "effect/Schema";
import { STATUS_CODES } from "node:http";

import { wireErrorSchema } from "#/trpc/wire-error-schema.ts";

const isWireError = Schema.is(wireErrorSchema);

const encodeWireError = Schema.encodeSync(wireErrorSchema);

/**
 * Encodes the Wire error of a tRPC error into `data.wireError`, and hides the
 * message of every error of 500 and above. It types only `error` and `shape`,
 * so both the server's router and the mobile Fake router use it.
 */
export function errorFormatter({
  error,
  shape,
}: {
  error: TRPCError;
  shape: TRPCDefaultErrorShape;
}) {
  const data = {
    ...shape.data,
    wireError: isWireError(error.cause) ? encodeWireError(error.cause) : null,
  };

  if (shape.data.httpStatus < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    return { ...shape, data };
  }

  return {
    ...shape,
    data,
    message: STATUS_CODES[shape.data.httpStatus] ?? "Internal Server Error",
  };
}
