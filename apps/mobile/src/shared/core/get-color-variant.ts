/**
 * Picks the Color variant that iOS shows: the Context of the appearance
 * Modifier for the color scheme from `useColorScheme()`, light when it's
 * `null`, and Increase Contrast, which React Native calls darker system colors
 * (https://reactnative.dev/docs/accessibilityinfo).
 */
export function getColorVariant({
  colorScheme,
  isDarkerSystemColorsEnabled,
}: {
  colorScheme: "dark" | "light" | null;
  isDarkerSystemColorsEnabled: boolean;
}) {
  if (colorScheme === "dark") {
    return isDarkerSystemColorsEnabled ? "darkHighContrast" : "dark";
  }

  return isDarkerSystemColorsEnabled ? "lightHighContrast" : "light";
}
