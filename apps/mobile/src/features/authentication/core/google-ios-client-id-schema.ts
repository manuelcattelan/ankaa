import * as Schema from "effect/Schema";

const GOOGLE_IOS_CLIENT_ID_PATTERN = /^.+\.apps\.googleusercontent\.com$/;

const googleIosClientIdFilter = Schema.isPattern(GOOGLE_IOS_CLIENT_ID_PATTERN);

export const googleIosClientIdSchema = Schema.Trim.check(
  googleIosClientIdFilter,
);
