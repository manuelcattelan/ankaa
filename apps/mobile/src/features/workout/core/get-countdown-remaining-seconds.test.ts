import { getCountdownRemainingSeconds } from "#/features/workout/core/get-countdown-remaining-seconds.ts";

const REST_COUNTDOWN = {
  seconds: 120,
  startTime: 1_000_000,
};

describe("getCountdownRemainingSeconds", () => {
  it("gives every second of the countdown when it has just started", () => {
    expect(
      getCountdownRemainingSeconds({
        countdown: REST_COUNTDOWN,
        currentTime: 1_000_000,
      }),
    ).toBe(120);
  });

  it("counts a second as remaining until it has fully passed", () => {
    expect(
      getCountdownRemainingSeconds({
        countdown: REST_COUNTDOWN,
        currentTime: 1_000_999,
      }),
    ).toBe(120);
  });

  it("takes off each second that has passed", () => {
    expect(
      getCountdownRemainingSeconds({
        countdown: REST_COUNTDOWN,
        currentTime: 1_090_000,
      }),
    ).toBe(30);
  });

  it("gives 0 once the countdown has ended", () => {
    expect(
      getCountdownRemainingSeconds({
        countdown: REST_COUNTDOWN,
        currentTime: 1_130_000,
      }),
    ).toBe(0);
  });
});
