import { resolveReferences } from "#/shared/core/resolve-references.ts";

// Placeholders until values are chosen, except percent40, today's disabled
// opacity.
const OPACITY_PRIMITIVES = {
  percent5: 0.05,
  percent10: 0.1,
  percent20: 0.2,
  percent30: 0.3,
  percent40: 0.4,
  percent50: 0.5,
  percent60: 0.6,
  percent70: 0.7,
  percent80: 0.8,
  percent90: 0.9,
};

export type OpacityPrimitiveName = keyof typeof OPACITY_PRIMITIVES;

const OPACITY_SEMANTIC_TOKENS = {
  disabled: "percent40",
  pressed: "percent70",
} satisfies Record<string, OpacityPrimitiveName>;

/**
 * The opacity Token family: the opacity of a whole control that is disabled
 * or pressed, and the primitives, named by percent, that code may use when no
 * Role fits. No setting changes an opacity, so the family has no Contexts.
 */
export const opacity = {
  ...OPACITY_PRIMITIVES,
  ...resolveReferences({
    primitives: OPACITY_PRIMITIVES,
    references: OPACITY_SEMANTIC_TOKENS,
  }),
};
