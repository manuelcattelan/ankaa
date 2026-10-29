import * as Data from "effect/Data";

type EmailErrorFields = {
  readonly cause: unknown;
  readonly message: string;
};

export class EmailError extends Data.TaggedError(
  "EmailError",
)<EmailErrorFields> {}
