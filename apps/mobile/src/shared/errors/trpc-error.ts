import * as Data from "effect/Data";

type TrpcErrorFields = {
  readonly cause: unknown;
};

export class TrpcError extends Data.TaggedError("TrpcError")<TrpcErrorFields> {}
