import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { isSqlError } from "effect/sql/SqlError";

/**
 * A failed query, whose `cause` holds the driver's error.
 */
type QueryError = { cause: unknown };

/**
 * Fails a write with the error that `errors` gives for the unique index it
 * breaks, which the driver reports as a `UniqueViolation` inside the query
 * error's `Cause`, and dies on a violation of any other index and on any
 * other failure of the write.
 */
export function catchUniqueIndexViolation<TError>({
  errors,
}: {
  errors: Record<string, TError>;
}) {
  return <TSuccess, TQueryError extends QueryError, TServices>(
    write: Effect.Effect<TSuccess, TQueryError, TServices>,
  ) =>
    Effect.catch(write, (queryError) => {
      const [, error] =
        Object.entries(errors).find(
          ([index]) =>
            Cause.isCause(queryError.cause) &&
            Option.exists(
              Cause.findErrorOption(queryError.cause),
              (sqlError) =>
                isSqlError(sqlError) &&
                sqlError.reason._tag === "UniqueViolation" &&
                sqlError.reason.constraint === index,
            ),
        ) ?? [];

      return error === undefined ? Effect.die(queryError) : Effect.fail(error);
    });
}
