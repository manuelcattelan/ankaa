import { mergeTokenSets } from "#/shared/core/merge-token-sets.ts";

describe("mergeTokenSets", () => {
  it("lays the Context of each input over the base set", () => {
    const sets = {
      base: { background: "neutral50", foreground: "neutral900" },
      modifiers: {
        appearance: {
          dark: { foreground: "neutral100" },
          darkHighContrast: { foreground: "white" },
          light: {},
          lightHighContrast: { foreground: "black" },
        },
      },
    };

    const tokens = mergeTokenSets({ inputs: { appearance: "dark" }, sets });

    expect(tokens).toStrictEqual({
      background: "neutral50",
      foreground: "neutral100",
    });
  });

  it("lays the Contexts over the base set in the Resolution order, so a later Modifier's Context wins", () => {
    const sets = {
      base: { weight: "regular" },
      modifiers: {
        appearance: {
          dark: { weight: "light" },
          darkHighContrast: {},
          light: {},
          lightHighContrast: {},
        },
        boldText: { boldTextOff: {}, boldTextOn: { weight: "bold" } },
        reduceMotion: {
          reduceMotionOff: {},
          reduceMotionOn: { weight: "medium" },
        },
      },
    };

    const tokens = mergeTokenSets({
      inputs: {
        appearance: "dark",
        boldText: "boldTextOn",
        reduceMotion: "reduceMotionOn",
      },
      sets,
    });

    expect(tokens).toStrictEqual({ weight: "bold" });
  });

  it("throws when a Modifier of the sets has no input", () => {
    const sets = {
      base: { weight: "regular" },
      modifiers: {
        boldText: { boldTextOff: {}, boldTextOn: { weight: "bold" } },
      },
    };

    expect(() => mergeTokenSets({ inputs: {}, sets })).toThrow(
      "The boldText Modifier has no input.",
    );
  });
});
