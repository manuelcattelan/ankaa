import * as Schema from "effect/Schema";

import { decodeForm } from "#/shared/core/decode-form.ts";

const formSchema = Schema.Struct({
  name: Schema.String.check(Schema.isNonEmpty({ message: "Enter a name." })),
  nickname: Schema.String.check(
    Schema.isMaxLength(3, { message: "Enter at most 3 characters." }),
    Schema.isPattern(/^[A-Z]*$/, { message: "Enter capital letters only." }),
  ),
});

const trimmedFormSchema = Schema.Struct({
  name: Schema.Trim,
  nickname: Schema.Trim,
}).check(
  Schema.makeFilter(({ name, nickname }) => name !== nickname, {
    message: "Enter a nickname that isn't your name.",
  }),
);

describe("decodeForm", () => {
  it("returns no message before the first submit, while telling whether the form is valid", () => {
    expect(
      decodeForm({
        hasSubmitted: false,
        schema: formSchema,
        values: { name: "", nickname: "ADA" },
      }),
    ).toEqual({
      errorMessage: null,
      errorMessages: { name: null, nickname: null },
      isValid: false,
      value: null,
    });
  });

  it("returns no message for any field, a valid form and its decoded value when every field is valid", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: trimmedFormSchema,
        values: { name: " Ada ", nickname: "ADA" },
      }),
    ).toEqual({
      errorMessage: null,
      errorMessages: { name: null, nickname: null },
      isValid: true,
      value: { name: "Ada", nickname: "ADA" },
    });
  });

  it("returns the message of an invalid field, no message for a valid field, an invalid form and no value", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: formSchema,
        values: { name: "", nickname: "ADA" },
      }),
    ).toEqual({
      errorMessage: null,
      errorMessages: { name: "Enter a name.", nickname: null },
      isValid: false,
      value: null,
    });
  });

  it("returns the message of every invalid field", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: formSchema,
        values: { name: "", nickname: "ADDA" },
      }),
    ).toEqual({
      errorMessage: null,
      errorMessages: {
        name: "Enter a name.",
        nickname: "Enter at most 3 characters.",
      },
      isValid: false,
      value: null,
    });
  });

  it("returns the message of the first check that a field breaks", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: formSchema,
        values: { name: "Ada", nickname: "adda" },
      }),
    ).toEqual({
      errorMessage: null,
      errorMessages: { name: null, nickname: "Enter at most 3 characters." },
      isValid: false,
      value: null,
    });
  });

  it("returns the message of a check on the whole form, and no message for its fields", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: trimmedFormSchema,
        values: { name: "ADA", nickname: "ADA" },
      }),
    ).toEqual({
      errorMessage: "Enter a nickname that isn't your name.",
      errorMessages: { name: null, nickname: null },
      isValid: false,
      value: null,
    });
  });
});
