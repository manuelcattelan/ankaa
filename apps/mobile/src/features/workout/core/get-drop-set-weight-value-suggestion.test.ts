import { getDropSetWeightValueSuggestion } from "@/features/workout/core/get-drop-set-weight-value-suggestion";

describe("getDropSetWeightValueSuggestion", () => {
  it("suggests the previous weight minus the planned percentage", () => {
    expect(
      getDropSetWeightValueSuggestion({
        dropSetWeightPercentage: 15,
        previousWeightValueText: "85",
      }),
    ).toBe("72.25");
  });

  it("rounds the suggestion to two decimal places", () => {
    expect(
      getDropSetWeightValueSuggestion({
        dropSetWeightPercentage: 10,
        previousWeightValueText: "33.33",
      }),
    ).toBe("30");
  });

  it("suggests no weight when the Routine plans no percentage", () => {
    expect(
      getDropSetWeightValueSuggestion({
        dropSetWeightPercentage: undefined,
        previousWeightValueText: "85",
      }),
    ).toBe(undefined);
  });

  it("suggests no weight when the previous weight isn't valid", () => {
    expect(
      getDropSetWeightValueSuggestion({
        dropSetWeightPercentage: 15,
        previousWeightValueText: "",
      }),
    ).toBe(undefined);
  });

  it("suggests no weight when the suggestion would be below the minimum weight", () => {
    expect(
      getDropSetWeightValueSuggestion({
        dropSetWeightPercentage: 90,
        previousWeightValueText: "0.01",
      }),
    ).toBe(undefined);
  });
});
