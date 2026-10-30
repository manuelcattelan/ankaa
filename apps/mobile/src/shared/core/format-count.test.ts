import { formatCount } from "#/shared/core/format-count.ts";

describe("formatCount", () => {
  it("writes a count of 1 with the singular", () => {
    expect(
      formatCount({ count: 1, plural: "seconds", singular: "second" }),
    ).toBe("1 second");
  });

  it("writes a count of 2 with the plural", () => {
    expect(
      formatCount({ count: 2, plural: "seconds", singular: "second" }),
    ).toBe("2 seconds");
  });

  it("writes a count of 0 with the plural", () => {
    expect(
      formatCount({ count: 0, plural: "seconds", singular: "second" }),
    ).toBe("0 seconds");
  });
});
