import { getCooldownDeadline } from "#/features/authentication/core/get-cooldown-deadline.ts";

describe("getCooldownDeadline", () => {
  it("returns the start of the cooldown plus its seconds in milliseconds", () => {
    expect(getCooldownDeadline({ seconds: 60, start: 1_000_000 })).toBe(
      1_060_000,
    );
  });
});
