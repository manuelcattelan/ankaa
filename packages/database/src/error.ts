import * as Data from "effect/Data";

type DatabaseErrorFields = {
  readonly cause: unknown;
};

export class DatabaseError extends Data.TaggedError(
  "DatabaseError",
)<DatabaseErrorFields> {}
