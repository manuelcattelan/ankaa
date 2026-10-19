import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environment";
import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import * as Config from "effect/Config";
import * as Schema from "effect/Schema";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const authenticationConfiguration = Config.all({
  appleAppBundleIdentifier: Config.NonEmptyString(
    "APPLE_APP_BUNDLE_IDENTIFIER",
  ),
  baseUrl: Config.schema(urlSchema, "BETTER_AUTH_URL"),
  googleIosClientId: Config.NonEmptyString("GOOGLE_IOS_CLIENT_ID"),
  googleWebClientId: Config.NonEmptyString("GOOGLE_WEB_CLIENT_ID"),
  nodeEnvironment: Config.Literals(NODE_ENVIRONMENTS, "NODE_ENV"),
  secret: Config.schema(
    Schema.Redacted(
      Schema.String.check(
        Schema.isMinLength(BETTER_AUTH_SECRET_MINIMUM_LENGTH),
      ),
    ),
    "BETTER_AUTH_SECRET",
  ),
});
