import { getTextStyleGrowth } from "#/shared/core/get-text-style-growth.ts";

describe("getTextStyleGrowth", () => {
  it("grows Body by 53 / 17 at AX5", () => {
    expect(
      getTextStyleGrowth({ fontScale: 3.571, textStyle: "body" }),
    ).toBeCloseTo(3.1176, 4);
  });

  it("grows Large Title by 60 / 34 at AX5", () => {
    expect(
      getTextStyleGrowth({ fontScale: 3.571, textStyle: "largeTitle" }),
    ).toBeCloseTo(1.7647, 4);
  });

  it("leaves Body at its default size at Large", () => {
    expect(getTextStyleGrowth({ fontScale: 1, textStyle: "body" })).toBe(1);
  });

  it("leaves Large Title at its default size at Large", () => {
    expect(getTextStyleGrowth({ fontScale: 1, textStyle: "largeTitle" })).toBe(
      1,
    );
  });

  it("grows Caption 2 by 20 / 11 at AX1", () => {
    expect(
      getTextStyleGrowth({ fontScale: 1.786, textStyle: "caption2" }),
    ).toBeCloseTo(1.8182, 4);
  });
});
