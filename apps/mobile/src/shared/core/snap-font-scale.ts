// The fontScale that React Native reports on iOS for each text size Users can
// pick, from xSmall to AX5, Large being 1
// (https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/React/CoreModules/RCTAccessibilityManager.mm).
const IOS_FONT_SCALES = [
  0.823, 0.882, 0.941, 1, 1.118, 1.235, 1.353, 1.786, 2.143, 2.643, 3.143,
  3.571,
] as const;

/** One of the 12 `fontScale` values React Native reports on iOS. */
export type FontScale = (typeof IOS_FONT_SCALES)[number];

/**
 * Gives the value iOS reports that is nearest to `fontScale`, so a value from
 * outside iOS, such as Jest's 2, still finds a text size in the growth
 * lookup instead of failing it.
 */
export function snapFontScale(fontScale: number) {
  return IOS_FONT_SCALES.reduce<FontScale>(
    (nearestFontScale, iosFontScale) =>
      Math.abs(iosFontScale - fontScale) <
      Math.abs(nearestFontScale - fontScale)
        ? iosFontScale
        : nearestFontScale,
    1,
  );
}
