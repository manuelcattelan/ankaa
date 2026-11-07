import { SplashScreen } from "expo-router";
import { use, useEffect } from "react";

import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";
import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";

/**
 * Keeps the splash screen up until the first read of the session and the
 * first reads of Bold Text, Increase Contrast and Reduce Motion settle, so
 * the first frame Users see has the right settings.
 */
export function SplashScreenController() {
  const session = useAuthenticationSession();
  const accessibilityFlags = use(AccessibilityFlagsContext);

  const isPending = session.isPending || accessibilityFlags === null;

  useEffect(() => {
    void SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (!isPending) {
      SplashScreen.hide();
    }
  }, [isPending]);

  return null;
}
