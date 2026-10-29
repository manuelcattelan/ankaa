import * as Schema from "effect/Schema";

export class TrpcClientError extends Schema.TaggedError<TrpcClientError>()(
  "TrpcClientError",
  { cause: Schema.Defect() },
) {}
