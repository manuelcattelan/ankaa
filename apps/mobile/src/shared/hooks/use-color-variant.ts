import { use } from "react";
import { useColorScheme } from "react-native";

import { getColorVariant } from "#/shared/core/get-color-variant.ts";
import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";
import { color } from "#/shared/tokens/color.ts";

/**
 * Gives the plain colors of every color Role in the Color variant iOS shows
 * now, for an animated color, because Reanimated can't animate the
 * `DynamicColorIOS` that every other style takes from `color`.
 */
export function useColorVariant() {
  const colorScheme = useColorScheme();
  const accessibilityFlags = use(AccessibilityFlagsContext);

  return color.variants[
    getColorVariant({
      colorScheme,
      isDarkerSystemColorsEnabled:
        accessibilityFlags?.isDarkerSystemColorsEnabled ?? false,
    })
  ];
}
