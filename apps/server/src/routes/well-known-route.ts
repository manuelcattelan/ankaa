import type { FastifyPluginCallback } from "fastify";

import { ACCOUNT_DELETION_PATH } from "@ankaa/core/features/authentication/constants/account-deletion-path";

export type WellKnownRouteOptions = {
  appleAppBundleId: string;
  appleTeamId: string;
};

/**
 * Serves the file that lets the API host open the app through Universal
 * Links, for account deletion links only.
 */
export const wellKnownRoute = ((
  server,
  { appleAppBundleId, appleTeamId },
  done,
) => {
  // iOS reads this file without an extension, as JSON, and only from this
  // exact path (https://developer.apple.com/documentation/xcode/supporting-associated-domains).
  server.get("/apple-app-site-association", async (request, reply) =>
    reply.type("application/json").send({
      applinks: {
        details: [
          {
            appIDs: [`${appleTeamId}.${appleAppBundleId}`],
            components: [{ "/": `${ACCOUNT_DELETION_PATH}*` }],
          },
        ],
      },
    }),
  );

  done();
}) satisfies FastifyPluginCallback<WellKnownRouteOptions>;
