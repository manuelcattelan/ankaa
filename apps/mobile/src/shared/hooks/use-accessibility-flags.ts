import { use } from "react";

import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";

const UNREAD_ACCESSIBILITY_FLAGS = {
  isBoldTextEnabled: false,
  isDarkerSystemColorsEnabled: false,
  isReduceMotionEnabled: false,
};

/**
 * Gives the live Bold Text, Increase Contrast and Reduce Motion flags that
 * `TokenProvider` keeps, where a flag counts as off before its first read
 * settles, while the splash screen is still up.
 */
export function useAccessibilityFlags() {
  return use(AccessibilityFlagsContext) ?? UNREAD_ACCESSIBILITY_FLAGS;
}
