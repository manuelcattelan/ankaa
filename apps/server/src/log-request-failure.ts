import type { FastifyBaseLogger } from "fastify";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from "@ankaa/core/shared/constants/http-status-internal-server-error";

/**
 * Logs the failure of a request at info level when its status is below 500,
 * since the client caused it, and at error level otherwise.
 */
export function logRequestFailure({
  error,
  log,
  message,
  statusCode,
}: {
  error: unknown;
  log: FastifyBaseLogger;
  message: string;
  statusCode: number;
}) {
  if (statusCode < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    log.info(error, message);

    return;
  }

  log.error(error, message);
}
