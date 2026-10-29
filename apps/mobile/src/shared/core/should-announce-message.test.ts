import { shouldAnnounceMessage } from "#/shared/core/should-announce-message.ts";

describe("shouldAnnounceMessage", () => {
  it("returns true for a message on iOS", () => {
    expect(
      shouldAnnounceMessage({
        message: "Verification code sent.",
        platform: "ios",
      }),
    ).toBe(true);
  });

  it("returns false for an empty message", () => {
    expect(shouldAnnounceMessage({ message: "", platform: "ios" })).toBe(false);
  });

  it("returns false on Android", () => {
    expect(
      shouldAnnounceMessage({
        message: "Verification code sent.",
        platform: "android",
      }),
    ).toBe(false);
  });
});
