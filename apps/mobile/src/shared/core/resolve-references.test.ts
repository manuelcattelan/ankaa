import { resolveReferences } from "#/shared/core/resolve-references.ts";

describe("resolveReferences", () => {
  it("replaces each Semantic token's reference with the value of the Primitive token it names", () => {
    const primitives = { percent40: 0.4, percent70: 0.7 };

    const tokens = resolveReferences({
      primitives,
      references: { disabled: "percent40", pressed: "percent70" },
    });

    expect(tokens).toStrictEqual({ disabled: 0.4, pressed: 0.7 });
  });
});
