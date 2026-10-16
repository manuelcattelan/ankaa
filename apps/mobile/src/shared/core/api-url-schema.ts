import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import * as Schema from "effect/Schema";

const apiUrlTrailingSlashFilter = Schema.makeFilter(
  (apiUrl: string) => !apiUrl.endsWith("/"),
  { expected: "a URL that doesn't end with a slash" },
);

export const apiUrlSchema = urlSchema.check(apiUrlTrailingSlashFilter);
