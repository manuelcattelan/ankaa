import { formatTempo } from "@/features/routine/core/format-tempo";

describe("formatTempo", () => {
  it("removes the spaces around a Tempo", () => {
    expect(formatTempo(" 3-0-1-2 ")).toBe("3-0-1-2");
  });

  it("writes the X of a Tempo in uppercase", () => {
    expect(formatTempo("3-0-x-2")).toBe("3-0-X-2");
  });
});
