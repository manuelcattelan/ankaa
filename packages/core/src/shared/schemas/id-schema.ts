import * as Schema from "effect/Schema";

const UUID_VERSION = 7;

export const idSchema = Schema.String.check(Schema.isUUID(UUID_VERSION));
