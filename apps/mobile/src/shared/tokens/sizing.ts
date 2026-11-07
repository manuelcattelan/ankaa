import { resolveReferences } from "#/shared/core/resolve-references.ts";

// Placeholders until values are chosen, except md, Apple's minimum hit region
// of 44 by 44 points
// (https://developer.apple.com/design/human-interface-guidelines/accessibility#Buttons-and-controls).
const SIZING_PRIMITIVES = {
  lg: 56,
  md: 44,
  sm: 32,
};

const SIZING_SEMANTIC_TOKENS = {
  minimumHitTarget: "md",
} satisfies Record<string, keyof typeof SIZING_PRIMITIVES>;

/**
 * The sizing Token family: the smallest Hit target, which a control meets
 * with its own `minHeight` and `minWidth` and which never scales with text
 * size. No setting changes a size, so the family has no Contexts.
 */
export const sizing = {
  ...SIZING_PRIMITIVES,
  ...resolveReferences({
    primitives: SIZING_PRIMITIVES,
    references: SIZING_SEMANTIC_TOKENS,
  }),
};
