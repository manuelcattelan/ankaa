import type { FastifyPluginCallback } from "fastify";

import type { ApplicationPluginOptions } from "#/application-plugin.ts";

/**
 * Serves the files that let the API host open the app: Apple's for Universal
 * Links and Google's for App Links, for account deletion links only.
 */
export const wellKnownRoute = ((
  server,
  {
    androidAppPackageName,
    androidAppSha256CertificateFingerprints,
    appleAppBundleIdentifier,
    appleTeamIdentifier,
  },
  done,
) => {
  // iOS reads this file without an extension, as JSON, and only from this
  // exact path (https://developer.apple.com/documentation/xcode/supporting-associated-domains).
  server.get("/apple-app-site-association", async (request, reply) =>
    reply.type("application/json").send({
      applinks: {
        details: [
          {
            appIDs: [`${appleTeamIdentifier}.${appleAppBundleIdentifier}`],
            components: [{ "/": "/delete-account*" }],
          },
        ],
      },
    }),
  );

  // Android checks the signing certificate of the installed app against these
  // fingerprints (https://developer.android.com/training/app-links/verify-android-applinks).
  server.get("/assetlinks.json", async (request, reply) =>
    reply.send([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          ["namespace"]: "android_app",
          ["package_name"]: androidAppPackageName,
          ["sha256_cert_fingerprints"]: androidAppSha256CertificateFingerprints,
        },
      },
    ]),
  );

  done();
}) satisfies FastifyPluginCallback<Omit<ApplicationPluginOptions, "runtime">>;
