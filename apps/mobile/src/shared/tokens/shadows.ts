import type { BoxShadowValue } from "react-native";

import * as Record from "effect/Record";

import { resolveReferences } from "#/shared/core/resolve-references.ts";
import { color } from "#/shared/tokens/color.ts";

// Placeholders until values are chosen. iOS draws the blur at half the given
// blurRadius
// (https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/React/Fabric/Utils/RCTBoxShadow.mm#L67).
const SHADOW_PRIMITIVES = {
  md: { blurRadius: 16, offsetX: 0, offsetY: 4, spreadDistance: 0 },
} satisfies Record<string, Omit<BoxShadowValue, "color" | "inset">>;

const SHADOW_SEMANTIC_TOKENS = {
  floating: "md",
} satisfies Record<string, keyof typeof SHADOW_PRIMITIVES>;

/**
 * The shadows Token family: each Role is a `boxShadow` object array, as DTCG's
 * Shadow type, whose color is `color.shadow`, so it follows appearance and
 * Increase Contrast natively. A primitive is a colorless geometry, so a shadow
 * built from one takes `color.shadow` too.
 */
export const shadows = {
  ...SHADOW_PRIMITIVES,
  ...Record.map(
    resolveReferences({
      primitives: SHADOW_PRIMITIVES,
      references: SHADOW_SEMANTIC_TOKENS,
    }),
    (geometry) => [{ ...geometry, color: color.shadow }],
  ),
};
