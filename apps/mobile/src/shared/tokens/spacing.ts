import { resolveReferences } from "#/shared/core/resolve-references.ts";

// Placeholders until values are chosen, on a 4-point grid.
const SPACING_PRIMITIVES = {
  lg: 16,
  md: 12,
  sm: 8,
  xl: 24,
  xs: 4,
  xxl: 32,
  xxxl: 48,
};

const SPACING_SEMANTIC_TOKENS = {
  horizontalScreenMargin: "lg",
  verticalScreenMargin: "lg",
} satisfies Record<string, keyof typeof SPACING_PRIMITIVES>;

/**
 * The spacing Token family: one scale on a 4-point grid, which never scales
 * with text size, and the two Screen margins, applied as padding on top of
 * the insets iOS reserves. No setting changes a spacing, so the family has no
 * Contexts.
 */
export const spacing = {
  ...SPACING_PRIMITIVES,
  ...resolveReferences({
    primitives: SPACING_PRIMITIVES,
    references: SPACING_SEMANTIC_TOKENS,
  }),
};
