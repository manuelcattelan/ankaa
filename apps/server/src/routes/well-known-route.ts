import type { FastifyPluginCallback } from "fastify";

import { ACCOUNT_DELETION_PATH } from "@ankaa/core/features/authentication/constants/account-deletion-path";

export type WellKnownRouteOptions = {
  android: null | {
    packageName: string;
    sha256CertificateFingerprints: readonly string[];
  };
  appleAppBundleId: string;
  appleTeamId: string;
};

/**
 * Serves the files that let the API host open the app: Apple's for Universal
 * Links and, when the Android settings are set, Google's for App Links, for
 * account deletion links only.
 */
export const wellKnownRoute = ((
  server,
  { android, appleAppBundleId, appleTeamId },
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

  if (android !== null) {
    // Android checks the signing certificate of the installed app against
    // these fingerprints (https://developer.android.com/training/app-links/verify-android-applinks).
    server.get("/assetlinks.json", async (request, reply) =>
      reply.send([
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            ["package_name"]: android.packageName,
            ["sha256_cert_fingerprints"]: android.sha256CertificateFingerprints,
          },
        },
      ]),
    );
  }

  done();
}) satisfies FastifyPluginCallback<WellKnownRouteOptions>;
