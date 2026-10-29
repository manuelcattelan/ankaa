import * as Schema from "effect/Schema";

import { emailFormSchema } from "#/features/authentication/core/email-form-schema.ts";

const EMAIL_FORM = { email: "name@example.com" };

const decodeEmailForm = Schema.decodeUnknownSync(emailFormSchema);

describe("emailFormSchema", () => {
  it("accepts an address like name@example.com", () => {
    expect(decodeEmailForm(EMAIL_FORM)).toEqual({ email: "name@example.com" });
  });

  it("accepts a local part with dots and a plus, and a domain with a subdomain", () => {
    expect(
      decodeEmailForm({
        ...EMAIL_FORM,
        email: "first.last+tag@mail.example.com",
      }),
    ).toEqual({ email: "first.last+tag@mail.example.com" });
  });

  it("rejects an address without an @", () => {
    expect(() =>
      decodeEmailForm({ ...EMAIL_FORM, email: "name.example.com" }),
    ).toThrow(
      "This email address isn't valid: enter an address like name@example.com.",
    );
  });

  it("rejects a local part with two dots in a row", () => {
    expect(() =>
      decodeEmailForm({ ...EMAIL_FORM, email: "first..last@example.com" }),
    ).toThrow(
      "This email address isn't valid: enter an address like name@example.com.",
    );
  });

  it("rejects a top-level domain of one letter", () => {
    expect(() =>
      decodeEmailForm({ ...EMAIL_FORM, email: "name@example.c" }),
    ).toThrow(
      "This email address isn't valid: enter an address like name@example.com.",
    );
  });

  it("rejects an address surrounded by spaces", () => {
    expect(() =>
      decodeEmailForm({ ...EMAIL_FORM, email: " name@example.com " }),
    ).toThrow(
      "This email address isn't valid: enter an address like name@example.com.",
    );
  });
});
