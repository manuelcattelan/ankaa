import { computeConcentricRadius } from "#/shared/core/compute-concentric-radius.ts";

describe("computeConcentricRadius", () => {
  it("subtracts the padding from the parent's radius", () => {
    const concentricRadius = computeConcentricRadius({
      fallbackRadius: 4,
      padding: 8,
      parentRadius: 20,
    });

    expect(concentricRadius).toBe(12);
  });

  it("takes the Fallback radius when the parent's radius minus the padding falls below it", () => {
    const concentricRadius = computeConcentricRadius({
      fallbackRadius: 4,
      padding: 16,
      parentRadius: 12,
    });

    expect(concentricRadius).toBe(4);
  });
});
