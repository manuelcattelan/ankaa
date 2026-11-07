import * as Record from "effect/Record";

import type {
  ModifierContexts,
  TokenSets,
} from "#/shared/core/merge-token-sets.ts";

import { composeColor } from "#/shared/core/compose-color.ts";
import { mergeTokenSets } from "#/shared/core/merge-token-sets.ts";

/**
 * What a color Semantic token points at in a Context: a color primitive, or a
 * color primitive and the opacity primitive to compose it with.
 */
export type ColorReference<
  ColorPrimitiveName extends string,
  OpacityPrimitiveName extends string,
> =
  | ColorPrimitiveName
  | { color: ColorPrimitiveName; opacity: OpacityPrimitiveName };

// The Context of the appearance Modifier for each key that DynamicColorIOS
// takes (https://reactnative.dev/docs/dynamiccolorios).
const DYNAMIC_COLOR_APPEARANCES = {
  dark: "dark",
  highContrastDark: "darkHighContrast",
  highContrastLight: "lightHighContrast",
  light: "light",
} satisfies Record<string, ModifierContexts["appearance"]>;

/**
 * Resolves each color Semantic token to its plain colors in the four Contexts
 * of the appearance Modifier, keyed as `DynamicColorIOS` takes them, so the
 * color token file packs each into one color that iOS switches on its own
 * (https://reactnative.dev/docs/dynamiccolorios). A reference names a color
 * primitive, or a color primitive and the opacity primitive to compose it
 * with.
 */
export function resolveColors<
  ColorPrimitiveName extends string,
  OpacityPrimitiveName extends string,
  Role extends string,
>({
  opacityPrimitives,
  primitives,
  sets,
}: {
  opacityPrimitives: Record<OpacityPrimitiveName, number>;
  primitives: Record<ColorPrimitiveName, string>;
  sets: TokenSets<
    Record<Role, ColorReference<ColorPrimitiveName, OpacityPrimitiveName>>
  >;
}) {
  const colorVariants = Record.map(DYNAMIC_COLOR_APPEARANCES, (appearance) =>
    resolveColorVariant({ appearance, opacityPrimitives, primitives, sets }),
  );

  return Record.map(colorVariants.light, (lightColor, role) =>
    Record.map(colorVariants, (colorVariant) => colorVariant[role]),
  );
}

function resolveColorVariant<
  ColorPrimitiveName extends string,
  OpacityPrimitiveName extends string,
  Role extends string,
>({
  appearance,
  opacityPrimitives,
  primitives,
  sets,
}: {
  appearance: ModifierContexts["appearance"];
  opacityPrimitives: Record<OpacityPrimitiveName, number>;
  primitives: Record<ColorPrimitiveName, string>;
  sets: TokenSets<
    Record<Role, ColorReference<ColorPrimitiveName, OpacityPrimitiveName>>
  >;
}) {
  return Record.map(
    mergeTokenSets({ inputs: { appearance }, sets }),
    (reference) =>
      typeof reference === "string"
        ? primitives[reference]
        : composeColor({
            color: primitives[reference.color],
            opacity: opacityPrimitives[reference.opacity],
          }),
  );
}
