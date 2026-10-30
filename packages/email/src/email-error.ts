import * as Schema from "effect/Schema";

export class EmailError extends Schema.TaggedError<EmailError>()("EmailError", {
  cause: Schema.Defect(),
  message: Schema.String,
}) {}
