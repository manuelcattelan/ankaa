import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { isSqlError } from "effect/sql/SqlError";

/**
 * A failed query, whose `cause` holds the driver's error.
 */
type QueryError = { cause: unknown };

/**
 * Fails a write with `error` when it breaks the unique index `index`, which
 * the driver reports as a `UniqueViolation` inside the query error's
 * `Cause`, and dies on any other failure of the write.
 */
export function catchUniqueIndexViolation<TError>({
  error,
  index,
}: {
  error: TError;
  index: string;
}) {
  return <TSuccess, TQueryError extends QueryError, TServices>(
    write: Effect.Effect<TSuccess, TQueryError, TServices>,
  ) =>
    Effect.catch(write, (queryError) =>
      Cause.isCause(queryError.cause) &&
      Option.exists(
        Cause.findErrorOption(queryError.cause),
        (sqlError) =>
          isSqlError(sqlError) &&
          sqlError.reason._tag === "UniqueViolation" &&
          sqlError.reason.constraint === index,
      )
        ? Effect.fail(error)
        : Effect.die(queryError),
    );
}
