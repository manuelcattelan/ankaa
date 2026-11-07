import * as Record from "effect/Record";

import type {
  ModifierContexts,
  TokenSets,
} from "#/shared/core/merge-token-sets.ts";

import { composeColor } from "#/shared/core/compose-color.ts";
import { mergeTokenSets } from "#/shared/core/merge-token-sets.ts";

export type ColorReference<
  ColorPrimitiveName extends string,
  OpacityPrimitiveName extends string,
> =
  | ColorPrimitiveName
  | { color: ColorPrimitiveName; opacity: OpacityPrimitiveName };

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
  const light = resolveColorVariant({
    appearance: "light",
    opacityPrimitives,
    primitives,
    sets,
  });
  const dark = resolveColorVariant({
    appearance: "dark",
    opacityPrimitives,
    primitives,
    sets,
  });
  const lightHighContrast = resolveColorVariant({
    appearance: "lightHighContrast",
    opacityPrimitives,
    primitives,
    sets,
  });
  const darkHighContrast = resolveColorVariant({
    appearance: "darkHighContrast",
    opacityPrimitives,
    primitives,
    sets,
  });

  return Record.map(light, (lightColor, role) => ({
    dark: dark[role],
    highContrastDark: darkHighContrast[role],
    highContrastLight: lightHighContrast[role],
    light: lightColor,
  }));
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
