import { parseWeightValue } from "@/features/workout/core/parse-weight-value";

describe("parseWeightValue", () => {
  it("parses a whole weight", () => {
    expect(parseWeightValue("80")).toBe(80);
  });

  it("parses a weight with two decimal places", () => {
    expect(parseWeightValue("82.25")).toBe(82.25);
  });

  it("parses a weight with a decimal comma", () => {
    expect(parseWeightValue("82,5")).toBe(82.5);
  });

  it("parses a weight surrounded by spaces", () => {
    expect(parseWeightValue(" 80 ")).toBe(80);
  });

  it("parses the minimum weight", () => {
    expect(parseWeightValue("0.01")).toBe(0.01);
  });

  it("parses the maximum weight", () => {
    expect(parseWeightValue("9999.99")).toBe(9_999.99);
  });

  it("rejects a weight with three decimal places", () => {
    expect(parseWeightValue("82.125")).toBe(undefined);
  });

  it("rejects a weight of 0 as below the minimum", () => {
    expect(parseWeightValue("0")).toBe(undefined);
  });

  it("rejects a weight above the maximum", () => {
    expect(parseWeightValue("10000")).toBe(undefined);
  });

  it("rejects a negative weight", () => {
    expect(parseWeightValue("-5")).toBe(undefined);
  });

  it("rejects a weight in exponent notation", () => {
    expect(parseWeightValue("1e2")).toBe(undefined);
  });

  it("rejects a text that isn't a number", () => {
    expect(parseWeightValue("heavy")).toBe(undefined);
  });

  it("rejects an empty text", () => {
    expect(parseWeightValue("")).toBe(undefined);
  });
});
