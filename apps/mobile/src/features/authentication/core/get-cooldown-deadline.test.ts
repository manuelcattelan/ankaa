import { getCooldownDeadline } from "@/features/authentication/core/get-cooldown-deadline";

describe("getCooldownDeadline", () => {
  it("returns the start of the cooldown plus its seconds in milliseconds", () => {
    expect(
      getCooldownDeadline({ cooldownSeconds: 60, cooldownStart: 1_000_000 }),
    ).toBe(1_060_000);
  });
});
