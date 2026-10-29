import { shouldAnnounceMessage } from "#/shared/core/should-announce-message.ts";

describe("shouldAnnounceMessage", () => {
  it("returns true for a message", () => {
    expect(shouldAnnounceMessage({ message: "Verification code sent." })).toBe(
      true,
    );
  });

  it("returns false for an empty message", () => {
    expect(shouldAnnounceMessage({ message: "" })).toBe(false);
  });
});
