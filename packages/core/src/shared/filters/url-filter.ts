import * as Schema from "effect/Schema";

export const urlFilter = Schema.makeFilter((url: string) => URL.canParse(url), {
  expected: "a valid URL",
});
