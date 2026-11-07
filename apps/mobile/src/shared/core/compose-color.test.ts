import { composeColor } from "#/shared/core/compose-color.ts";

describe("composeColor", () => {
  it("adds the opacity to the hex color as its alpha", () => {
    const composedColor = composeColor({ color: "#000000", opacity: 0.4 });

    expect(composedColor).toBe("#00000066");
  });

  it("writes an alpha below 16 with two hex digits", () => {
    const composedColor = composeColor({ color: "#ffffff", opacity: 0.05 });

    expect(composedColor).toBe("#ffffff0d");
  });
});
