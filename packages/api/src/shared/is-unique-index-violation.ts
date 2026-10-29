import * as Cause from "effect/Cause";
import * as Option from "effect/Option";
import { isSqlError } from "effect/sql/SqlError";

/**
 * Tells whether a query failed on the unique index `index`, which the driver
 * reports as a `UniqueViolation` inside the query error's `Cause`.
 */
export function isUniqueIndexViolation({
  error,
  index,
}: {
  error: { cause: unknown };
  index: string;
}) {
  return (
    Cause.isCause(error.cause) &&
    Option.exists(
      Cause.findErrorOption(error.cause),
      (sqlError) =>
        isSqlError(sqlError) &&
        sqlError.reason._tag === "UniqueViolation" &&
        sqlError.reason.constraint === index,
    )
  );
}
