import * as Result from "effect/Result";

/**
 * Tells whether an accessibility setting is on from a read of it, where a
 * failed read counts as off, because `AccessibilityInfo` rejects a read when
 * its native module is missing (https://reactnative.dev/docs/accessibilityinfo).
 */
export function isAccessibilitySettingEnabled({
  read,
}: {
  read: Result.Result<boolean, unknown>;
}) {
  return Result.getOrElse(read, () => false);
}
