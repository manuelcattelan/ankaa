import { formatElapsedTime } from "#/features/workout/core/format-elapsed-time.ts";

describe("formatElapsedTime", () => {
  it("writes 0 seconds as 0:00:00", () => {
    expect(formatElapsedTime(0)).toBe("0:00:00");
  });

  it("pads the seconds to two digits", () => {
    expect(formatElapsedTime(5)).toBe("0:00:05");
  });

  it("carries 60 seconds over into a minute", () => {
    expect(formatElapsedTime(60)).toBe("0:01:00");
  });

  it("carries 60 minutes over into an hour", () => {
    expect(formatElapsedTime(3661)).toBe("1:01:01");
  });

  it("writes the hours without padding", () => {
    expect(formatElapsedTime(36_000)).toBe("10:00:00");
  });
});
