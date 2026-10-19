import { getElapsedSeconds } from "@/features/workout/core/get-elapsed-seconds";

describe("getElapsedSeconds", () => {
  it("returns the whole seconds since the Workout started", () => {
    expect(
      getElapsedSeconds({
        currentTime: 1_792_396_890_000,
        startedAt: "2026-10-19T08:00:00.000Z",
      }),
    ).toBe(90);
  });

  it("rounds a part of a second down", () => {
    expect(
      getElapsedSeconds({
        currentTime: 1_792_396_890_999,
        startedAt: "2026-10-19T08:00:00.000Z",
      }),
    ).toBe(90);
  });

  it("returns 0 when the current time is before the start", () => {
    expect(
      getElapsedSeconds({
        currentTime: 1_792_396_790_000,
        startedAt: "2026-10-19T08:00:00.000Z",
      }),
    ).toBe(0);
  });
});
