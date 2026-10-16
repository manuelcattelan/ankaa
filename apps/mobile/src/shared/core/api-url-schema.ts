import { urlFilter } from "@ankaa/core/shared/filters/url-filter";
import * as Schema from "effect/Schema";

const apiUrlTrailingSlashFilter = Schema.makeFilter(
  (apiUrl: string) => !apiUrl.endsWith("/"),
  { expected: "a URL that doesn't end with a slash" },
);

export const apiUrlSchema = Schema.Trim.check(
  urlFilter,
  apiUrlTrailingSlashFilter,
);
