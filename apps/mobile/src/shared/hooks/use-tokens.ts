import { use } from "react";

import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";

/**
 * Gives each Token family with a live Modifier in the Context that the live
 * flags select, and re-renders its caller when a flag changes, so a style
 * appended after a module-level `StyleSheet.create` style follows Bold Text
 * and Reduce Motion. No family has a live Modifier yet. Each one adds its key
 * here, such as `typography: accessibilityFlags?.isBoldTextEnabled === true ?
 * typography.boldTextOn : typography.boldTextOff`, where a flag counts as off
 * before its first read settles, while the splash screen is still up.
 */
export function useTokens() {
  use(AccessibilityFlagsContext);

  return {};
}
