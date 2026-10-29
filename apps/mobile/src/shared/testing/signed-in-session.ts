import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";

type Session =
  AuthenticationClient["Service"]["authClient"]["$Infer"]["Session"];

const SIGNED_IN_AT = "2026-10-19T08:00:00.000Z";

const SIGNED_IN_USER_ID = "user-1";

export const signedInSession: Session = {
  session: {
    createdAt: new Date(SIGNED_IN_AT),
    expiresAt: new Date("2026-11-19T08:00:00.000Z"),
    id: "session-1",
    token: "session-token-1",
    updatedAt: new Date(SIGNED_IN_AT),
    userId: SIGNED_IN_USER_ID,
  },
  user: {
    createdAt: new Date(SIGNED_IN_AT),
    email: "athlete@example.com",
    emailVerified: true,
    id: SIGNED_IN_USER_ID,
    name: "Athlete",
    updatedAt: new Date(SIGNED_IN_AT),
  },
};
