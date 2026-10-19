import { validateEmail } from "@/features/authentication/core/validate-email";

describe("validateEmail", () => {
  it("accepts an address like name@example.com", () => {
    expect(validateEmail("name@example.com")).toEqual({ _tag: "EmailValid" });
  });

  it("accepts a local part with dots and a plus, and a domain with a subdomain", () => {
    expect(validateEmail("first.last+tag@mail.example.com")).toEqual({
      _tag: "EmailValid",
    });
  });

  it("rejects an address without an @ as invalid", () => {
    expect(validateEmail("name.example.com")).toEqual({
      _tag: "EmailInvalid",
    });
  });

  it("rejects a local part with two dots in a row as invalid", () => {
    expect(validateEmail("first..last@example.com")).toEqual({
      _tag: "EmailInvalid",
    });
  });

  it("rejects a top-level domain of one letter as invalid", () => {
    expect(validateEmail("name@example.c")).toEqual({ _tag: "EmailInvalid" });
  });

  it("rejects an address surrounded by spaces as invalid", () => {
    expect(validateEmail(" name@example.com ")).toEqual({
      _tag: "EmailInvalid",
    });
  });
});
