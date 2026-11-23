import { snapFontScale } from "#/shared/core/snap-font-scale.ts";

describe("snapFontScale", () => {
  it("snaps 2 to AX2's 2.143, the nearest value iOS reports", () => {
    expect(snapFontScale(2)).toBe(2.143);
  });

  it("keeps AX1's 1.786, a value iOS reports", () => {
    expect(snapFontScale(1.786)).toBe(1.786);
  });

  it("snaps a value below xSmall to xSmall's 0.823", () => {
    expect(snapFontScale(0.5)).toBe(0.823);
  });

  it("snaps a value above AX5 to AX5's 3.571", () => {
    expect(snapFontScale(5)).toBe(3.571);
  });
});
