import { createContext } from "react";

export type AccessibilityFlags = {
  isBoldTextEnabled: boolean;
  isDarkerSystemColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
};

/**
 * The live Bold Text, Increase Contrast and Reduce Motion flags that
 * `TokenProvider` keeps, `null` until their first reads settle, while the
 * splash screen is still up.
 */
export const AccessibilityFlagsContext =
  createContext<AccessibilityFlags | null>(null);
