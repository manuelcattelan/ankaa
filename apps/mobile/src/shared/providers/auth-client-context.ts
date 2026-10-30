import { createContext } from "react";

import type { AuthClient } from "#/shared/services/make-authentication-client.ts";

/**
 * The better-auth client of the `AuthenticationClient` Service, which the
 * Composition root takes from the Runtime once, so a component reads the
 * session through better-auth's hook without running Effect during render.
 */
export const AuthClientContext = createContext<AuthClient | null>(null);
