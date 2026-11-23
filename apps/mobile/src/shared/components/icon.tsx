import type { ComponentType } from "react";
import type { AccessibilityProps, ColorValue } from "react-native";
import type { SvgProps } from "react-native-svg";

import { createElement } from "react";
import { useWindowDimensions } from "react-native";

import type { IconographyTokenName } from "#/shared/tokens/iconography.ts";

import { getTextStyleGrowth } from "#/shared/core/get-text-style-growth.ts";
import { snapFontScale } from "#/shared/core/snap-font-scale.ts";
import { useTokens } from "#/shared/hooks/use-tokens.ts";

/**
 * Renders an icon imported from an `.svg` file in `shared/icons/` at the size
 * of its iconography token, grown by its Text style's growth at the current
 * text size with no cap, colored with a Foreground token, and stroked with
 * the token's Stroke in the current Bold Text Context. The file's shapes
 * carry no `stroke-width` of their own, so they take the Stroke from here.
 */
export function Icon({
  color,
  icon,
  name,
  ...rest
}: Pick<SvgProps, "opacity" | "style" | keyof AccessibilityProps> & {
  color: ColorValue;
  icon: ComponentType<SvgProps>;
  name: IconographyTokenName;
}) {
  const windowDimensions = useWindowDimensions();
  const tokens = useTokens();

  const token = tokens.iconography[name];
  const size =
    token.size *
    getTextStyleGrowth({
      fontScale: snapFontScale(windowDimensions.fontScale),
      textStyle: token.textStyle,
    });

  // An .svg file imports as a component under a camelCase name, such as
  // chevronIcon, which JSX would read as a host element.
  return createElement(icon, {
    ...rest,
    color,
    height: size,
    strokeWidth: token.stroke,
    width: size,
  });
}
