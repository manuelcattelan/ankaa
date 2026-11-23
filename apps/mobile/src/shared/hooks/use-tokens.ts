import { useAccessibilityFlags } from "#/shared/hooks/use-accessibility-flags.ts";
import { iconography } from "#/shared/tokens/iconography.ts";
import { motion } from "#/shared/tokens/motion.ts";
import { typography } from "#/shared/tokens/typography.ts";

/**
 * Gives each Token family with a live Modifier in the Context that the live
 * flags select, and re-renders its caller when a flag changes, so a style
 * appended after a module-level `StyleSheet.create` style follows Bold Text
 * and Reduce Motion.
 */
export function useTokens() {
  const accessibilityFlags = useAccessibilityFlags();

  return {
    iconography: accessibilityFlags.isBoldTextEnabled
      ? iconography.boldTextOn
      : iconography.boldTextOff,
    motion: accessibilityFlags.isReduceMotionEnabled
      ? motion.reduceMotionOn
      : motion.reduceMotionOff,
    typography: accessibilityFlags.isBoldTextEnabled
      ? typography.boldTextOn
      : typography.boldTextOff,
  };
}
