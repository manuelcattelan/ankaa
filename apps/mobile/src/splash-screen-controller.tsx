import { SplashScreen } from "expo-router";
import { useEffect } from "react";

import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";

/**
 * Keeps the splash screen up until the first read of the session settles.
 */
export function SplashScreenController() {
  const session = useAuthenticationSession();

  useEffect(() => {
    void SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (!session.isPending) {
      SplashScreen.hide();
    }
  }, [session.isPending]);

  return null;
}
