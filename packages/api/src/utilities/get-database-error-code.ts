import type { DatabaseError } from "@ankaa/database/error";

import { TRPCError } from "@trpc/server";

export function getDatabaseErrorCode(error: DatabaseError) {
  return error.cause instanceof TRPCError
    ? error.cause.code
    : "INTERNAL_SERVER_ERROR";
}
