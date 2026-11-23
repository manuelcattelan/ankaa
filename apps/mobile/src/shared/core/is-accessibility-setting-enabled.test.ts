import * as Result from "effect/Result";

import { isAccessibilitySettingEnabled } from "#/shared/core/is-accessibility-setting-enabled.ts";

describe("isAccessibilitySettingEnabled", () => {
  it("returns the value that a read of the setting succeeds with", () => {
    expect(isAccessibilitySettingEnabled({ read: Result.succeed(true) })).toBe(
      true,
    );
  });

  it("returns false for a read of the setting that fails", () => {
    expect(
      isAccessibilitySettingEnabled({
        read: Result.fail(new Error("AccessibilityInfo is unavailable.")),
      }),
    ).toBe(false);
  });
});
