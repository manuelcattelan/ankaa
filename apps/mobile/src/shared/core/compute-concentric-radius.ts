/**
 * Computes a Concentric radius with Apple's formula, the parent's radius minus
 * the padding between the two shapes, never below the Fallback radius, so the
 * corners of both share a center (WWDC25 356,
 * https://developer.apple.com/videos/play/wwdc2025/356/). React Native has no
 * API for it, so a radius token computes it at module load.
 */
export function computeConcentricRadius({
  fallbackRadius,
  padding,
  parentRadius,
}: {
  fallbackRadius: number;
  padding: number;
  parentRadius: number;
}) {
  return Math.max(parentRadius - padding, fallbackRadius);
}
