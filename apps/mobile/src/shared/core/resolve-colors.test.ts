import { resolveColors } from "#/shared/core/resolve-colors.ts";

describe("resolveColors", () => {
  it("resolves each color Semantic token to its color in each Context of the appearance Modifier", () => {
    const sets = {
      base: { foreground: "neutral900" },
      modifiers: {
        appearance: {
          dark: { foreground: "neutral100" },
          darkHighContrast: { foreground: "white" },
          light: {},
          lightHighContrast: { foreground: "black" },
        },
      },
    };

    const colors = resolveColors({
      opacityPrimitives: { percent40: 0.4 },
      primitives: {
        black: "#000000",
        neutral100: "#e5e5e7",
        neutral900: "#1c1c1e",
        white: "#ffffff",
      },
      sets,
    });

    expect(colors).toStrictEqual({
      foreground: {
        dark: "#e5e5e7",
        highContrastDark: "#ffffff",
        highContrastLight: "#000000",
        light: "#1c1c1e",
      },
    });
  });

  it("composes a color primitive with the opacity primitive that a reference names beside it", () => {
    const overlay = { color: "black", opacity: "percent40" } as const;
    const sets = {
      base: { overlay },
      modifiers: {
        appearance: {
          dark: {},
          darkHighContrast: {},
          light: {},
          lightHighContrast: {},
        },
      },
    };

    const colors = resolveColors({
      opacityPrimitives: { percent40: 0.4 },
      primitives: { black: "#000000" },
      sets,
    });

    expect(colors).toStrictEqual({
      overlay: {
        dark: "#00000066",
        highContrastDark: "#00000066",
        highContrastLight: "#00000066",
        light: "#00000066",
      },
    });
  });
});
