import * as Schema from "effect/Schema";

import { otpCodeFormSchema } from "#/features/authentication/core/otp-code-form-schema.ts";

const OTP_CODE_FORM = { otpCode: "123456" };

const decodeOtpCodeForm = Schema.decodeUnknownSync(otpCodeFormSchema);

describe("otpCodeFormSchema", () => {
  it("accepts an OTP code of 6 digits", () => {
    expect(decodeOtpCodeForm(OTP_CODE_FORM)).toEqual({ otpCode: "123456" });
  });

  it("rejects an OTP code of 5 digits as incomplete", () => {
    expect(() =>
      decodeOtpCodeForm({ ...OTP_CODE_FORM, otpCode: "12345" }),
    ).toThrow("This verification code is incomplete: enter all 6 digits.");
  });
});
