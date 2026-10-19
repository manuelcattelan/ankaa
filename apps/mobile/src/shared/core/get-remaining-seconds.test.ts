import { getRemainingSeconds } from "@/shared/core/get-remaining-seconds";

describe("getRemainingSeconds", () => {
  it("returns the whole seconds left before the deadline", () => {
    expect(
      getRemainingSeconds({ currentTime: 1_000_000, deadline: 1_030_000 }),
    ).toBe(30);
  });

  it("rounds a part of a second left up to a whole second", () => {
    expect(
      getRemainingSeconds({ currentTime: 1_000_000, deadline: 1_029_001 }),
    ).toBe(30);
  });

  it("returns 0 once the deadline has passed", () => {
    expect(
      getRemainingSeconds({ currentTime: 1_030_500, deadline: 1_030_000 }),
    ).toBe(0);
  });
});
