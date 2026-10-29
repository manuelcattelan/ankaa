import * as Schema from "effect/Schema";

import { decodeForm } from "#/shared/core/decode-form.ts";

const formSchema = Schema.Struct({
  name: Schema.String.check(Schema.isNonEmpty({ message: "Enter a name." })),
  nickname: Schema.String.check(
    Schema.isMaxLength(3, { message: "Enter at most 3 characters." }),
    Schema.isPattern(/^[A-Z]*$/, { message: "Enter capital letters only." }),
  ),
});

describe("decodeForm", () => {
  it("returns no message for any field and a valid form when every field is valid", () => {
    expect(
      decodeForm({
        schema: formSchema,
        values: { name: "Ada", nickname: "ADA" },
      }),
    ).toEqual({
      errorMessages: { name: null, nickname: null },
      isValid: true,
    });
  });

  it("returns the message of an invalid field, no message for a valid field and an invalid form", () => {
    expect(
      decodeForm({
        schema: formSchema,
        values: { name: "", nickname: "ADA" },
      }),
    ).toEqual({
      errorMessages: { name: "Enter a name.", nickname: null },
      isValid: false,
    });
  });

  it("returns the message of every invalid field", () => {
    expect(
      decodeForm({
        schema: formSchema,
        values: { name: "", nickname: "ADDA" },
      }),
    ).toEqual({
      errorMessages: {
        name: "Enter a name.",
        nickname: "Enter at most 3 characters.",
      },
      isValid: false,
    });
  });

  it("returns the message of the first check that a field breaks", () => {
    expect(
      decodeForm({
        schema: formSchema,
        values: { name: "Ada", nickname: "adda" },
      }),
    ).toEqual({
      errorMessages: { name: null, nickname: "Enter at most 3 characters." },
      isValid: false,
    });
  });
});
