import * as Schema from "effect/Schema";

const IDENTIFIER_UUID_VERSION = 7;

export const identifierSchema = Schema.String.check(
  Schema.isUUID(IDENTIFIER_UUID_VERSION),
);
