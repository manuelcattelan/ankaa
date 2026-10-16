import * as Schema from "effect/Schema";

const urlFilter = Schema.makeFilter((url: string) => URL.canParse(url), {
  expected: "a valid URL",
});

export const urlSchema = Schema.Trim.check(urlFilter);
