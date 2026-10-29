import * as Data from "effect/Data";

type TrpcClientErrorFields = {
  readonly cause: unknown;
};

export class TrpcClientError extends Data.TaggedError(
  "TrpcClientError",
)<TrpcClientErrorFields> {}
