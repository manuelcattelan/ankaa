import * as Schema from "effect/Schema";

export class GooglePlayServicesMissingError extends Schema.TaggedError<GooglePlayServicesMissingError>()(
  "GooglePlayServicesMissingError",
  {},
) {}
