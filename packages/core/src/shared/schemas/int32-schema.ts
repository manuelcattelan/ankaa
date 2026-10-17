import * as Schema from "effect/Schema";

export const int32Schema = Schema.Number.check(Schema.isInt32());
