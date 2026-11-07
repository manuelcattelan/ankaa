// The fontScale React Native reports on iOS at AX1, the smallest
// Accessibility category
// (https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/React/CoreModules/RCTAccessibilityManager.mm).
const AX1_FONT_SCALE = 1.786;

/**
 * Tells whether the text size of `fontScale` is an Accessibility category,
 * where a component may change its layout to keep its text readable. It
 * holds the threshold in one place, because React Native has no API for the
 * content size category, only its `fontScale`.
 */
export function isAccessibilityCategory(fontScale: number) {
  return fontScale >= AX1_FONT_SCALE;
}
