import { getColorVariant } from "#/shared/core/get-color-variant.ts";

describe("getColorVariant", () => {
  it("returns light for the light color scheme with Increase Contrast off", () => {
    expect(
      getColorVariant({
        colorScheme: "light",
        isDarkerSystemColorsEnabled: false,
      }),
    ).toBe("light");
  });

  it("returns dark for the dark color scheme with Increase Contrast off", () => {
    expect(
      getColorVariant({
        colorScheme: "dark",
        isDarkerSystemColorsEnabled: false,
      }),
    ).toBe("dark");
  });

  it("returns lightHighContrast for the light color scheme with Increase Contrast on", () => {
    expect(
      getColorVariant({
        colorScheme: "light",
        isDarkerSystemColorsEnabled: true,
      }),
    ).toBe("lightHighContrast");
  });

  it("returns darkHighContrast for the dark color scheme with Increase Contrast on", () => {
    expect(
      getColorVariant({
        colorScheme: "dark",
        isDarkerSystemColorsEnabled: true,
      }),
    ).toBe("darkHighContrast");
  });
});
