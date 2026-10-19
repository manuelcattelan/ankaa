import { getRestRemainingSeconds } from "@/features/workout/core/get-rest-remaining-seconds";

describe("getRestRemainingSeconds", () => {
  it("returns the seconds of Rest left since the rest timer started", () => {
    expect(
      getRestRemainingSeconds({
        currentTime: 1_792_396_830_000,
        restTimer: { restSeconds: 90, startedAt: "2026-10-19T08:00:00.000Z" },
      }),
    ).toBe(60);
  });

  it("returns 0 once the Rest is over", () => {
    expect(
      getRestRemainingSeconds({
        currentTime: 1_792_396_900_000,
        restTimer: { restSeconds: 90, startedAt: "2026-10-19T08:00:00.000Z" },
      }),
    ).toBe(0);
  });

  it("returns 0 when no rest timer runs", () => {
    expect(
      getRestRemainingSeconds({
        currentTime: 1_792_396_830_000,
        restTimer: undefined,
      }),
    ).toBe(0);
  });
});
