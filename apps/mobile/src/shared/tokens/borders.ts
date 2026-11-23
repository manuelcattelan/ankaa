import { StyleSheet } from "react-native";

import { resolveReferences } from "#/shared/core/resolve-references.ts";

// Placeholders until values are chosen.
const BORDERS_STEPS = {
  lg: 4,
  md: 2,
  sm: 1,
};

// The hairline is the thinnest line the screen can draw, which React Native
// computes from the screen's scale
// (https://reactnative.dev/docs/stylesheet#hairlinewidth).
const bordersPrimitives = {
  ...BORDERS_STEPS,
  hairlineWidth: StyleSheet.hairlineWidth,
};

// Placeholder: width is the hairline, the width of today's text field
// outline, until values are chosen.
const BORDERS_SEMANTIC_TOKENS = {
  separatorWidth: "hairlineWidth",
  width: "hairlineWidth",
} satisfies Record<string, keyof typeof bordersPrimitives>;

/**
 * The borders Token family: border widths, with the width of a Separator,
 * paired with `color.separator`, and the default width of a Border, paired
 * with `color.border`. Every border is solid, and no setting changes a width,
 * so the family has no Contexts.
 */
export const borders = {
  ...bordersPrimitives,
  ...resolveReferences({
    primitives: bordersPrimitives,
    references: BORDERS_SEMANTIC_TOKENS,
  }),
};
