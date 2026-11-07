import { use } from "react";

import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";
import { typography } from "#/shared/tokens/typography.ts";

/**
 * Gives each Token family with a live Modifier in the Context that the live
 * flags select, and re-renders its caller when a flag changes, so a style
 * appended after a module-level `StyleSheet.create` style follows Bold Text
 * and Reduce Motion. A flag counts as off before its first read settles,
 * while the splash screen is still up.
 */
export function useTokens() {
  const accessibilityFlags = use(AccessibilityFlagsContext);

  return {
    typography:
      accessibilityFlags?.isBoldTextEnabled === true
        ? typography.boldTextOn
        : typography.boldTextOff,
  };
}
