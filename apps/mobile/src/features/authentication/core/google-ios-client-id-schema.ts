import { escape } from "effect/RegExp";
import * as Schema from "effect/Schema";

/**
 * Only `app.config.ts` imports it, which knip's production mode leaves out,
 * so the tag keeps knip from reporting it unused
 * (https://knip.dev/features/production-mode).
 *
 * @internal
 */
export const GOOGLE_IOS_CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";

const googleIosClientIdPattern = new RegExp(
  `^.+${escape(GOOGLE_IOS_CLIENT_ID_SUFFIX)}$`,
);

const googleIosClientIdFilter = Schema.isPattern(googleIosClientIdPattern);

export const googleIosClientIdSchema = Schema.Trim.check(
  googleIosClientIdFilter,
);
