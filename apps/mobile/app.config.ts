import type { ExpoConfig } from "expo/config";

import { ACCOUNT_DELETION_PATH } from "@ankaa/core/features/authentication/constants/account-deletion-path";
import { APPLICATION_SCHEMES } from "@ankaa/core/features/authentication/constants/application-schemes";
import * as Schema from "effect/Schema";

import {
  GOOGLE_IOS_CLIENT_ID_SUFFIX,
  googleIosClientIdSchema,
} from "./src/features/authentication/core/google-ios-client-id-schema.ts";
import { apiUrlSchema } from "./src/shared/core/api-url-schema.ts";

const APPLICATION_ID = "app.ankaa";
const DEVELOPMENT_APPLICATION_ID = "app.ankaa.development";
const APPLICATION_SLUG = "ankaa";
const APP_VARIANTS = ["development", "production"] as const;
const EAS_PROJECT_ID = "4cab2d0d-aa34-4dcf-a7a3-f553e3cd99c2";
const OWNER = "ankaa-mobile";

const SPLASH_IMAGE_WIDTH = 76;

// @expo/config's readConfigFile prefixes the message of the error that a
// config throws by assigning `error.message`, which SchemaError only has a
// getter for, so it would throw a TypeError that hides which setting is wrong
// (https://github.com/expo/expo/blob/119b336f677fc6ce44658ea34f79ba823028923d/packages/@expo/config/src/getConfig.ts#L16-L23).
function decodeSetting<TValue>({
  name,
  schema,
  value,
}: {
  name: string;
  schema: Schema.Decoder<TValue>;
  value: string | undefined;
}) {
  try {
    return Schema.decodeUnknownSync(schema)(value);
  } catch (error) {
    if (Schema.isSchemaError(error)) {
      throw new Error(`${name}: ${error.message}`, { cause: error });
    }

    throw error;
  }
}

/**
 * The app config that Expo and EAS read.
 */
export default function appConfig() {
  // `eas build` evaluates the config once to read the project's identity
  // before it loads the variables of the EAS environment, so without
  // APP_VARIANT the config decodes nothing and returns only that identity
  // (https://github.com/expo/eas-cli/blob/0a274a6fefd5e8142db68b0e2c07e6da98978049/packages/eas-cli/src/build/evaluateConfigWithEnvVarsAsync.ts#L27-L34).
  if (process.env.APP_VARIANT === undefined) {
    return {
      extra: { eas: { projectId: EAS_PROJECT_ID } },
      owner: OWNER,
      slug: APPLICATION_SLUG,
    };
  }

  const appVariant = decodeSetting({
    name: "APP_VARIANT",
    schema: Schema.Literals(APP_VARIANTS),
    value: process.env.APP_VARIANT,
  });
  const isDevelopmentVariant = appVariant === "development";

  const googleIosClientId = decodeSetting({
    name: "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
    schema: googleIosClientIdSchema,
    value: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const iosUrlScheme = `com.googleusercontent.apps.${googleIosClientId.slice(0, -GOOGLE_IOS_CLIENT_ID_SUFFIX.length)}`;

  // Account deletion links open the app through Universal Links and App Links on
  // the API's own host, which in development is the ngrok domain that
  // EXPO_PUBLIC_API_URL points to. `?mode=developer` lets a development build
  // associate with that domain without Apple's CDN, once Developer Mode and
  // Associated Domains Development are on in the device's settings
  // (https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.associated-domains),
  // and Android verifies the domain against the debug key's fingerprint in the
  // server's assetlinks.json
  // (https://developer.android.com/training/app-links/verify-android-applinks).
  // The production variant drops `?mode=developer`, which never works in a
  // TestFlight or App Store build, so iOS fetches the server's
  // apple-app-site-association file through Apple's CDN.
  const apiUrl = decodeSetting({
    name: "EXPO_PUBLIC_API_URL",
    schema: apiUrlSchema,
    value: process.env.EXPO_PUBLIC_API_URL,
  });
  const apiHost = new URL(apiUrl).host;

  return {
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        backgroundImage: "./assets/images/android-icon-background.png",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          category: ["BROWSABLE", "DEFAULT"],
          data: [
            {
              host: apiHost,
              pathPrefix: ACCOUNT_DELETION_PATH,
              scheme: "https",
            },
          ],
        },
      ],
      package: APPLICATION_ID,
      predictiveBackGestureEnabled: false,
    },
    experiments: {
      reactCompiler: true,
      typedRoutes: true,
    },
    extra: { eas: { projectId: EAS_PROJECT_ID } },
    icon: "./assets/images/icon.png",
    ios: {
      associatedDomains: [
        isDevelopmentVariant
          ? `applinks:${apiHost}?mode=developer`
          : `applinks:${apiHost}`,
      ],
      bundleIdentifier: isDevelopmentVariant
        ? DEVELOPMENT_APPLICATION_ID
        : APPLICATION_ID,
      // The app uses only the encryption that iOS itself provides, which is
      // exempt from export compliance documentation, so TestFlight needs no
      // answer for each build. This holds only while every cipher comes from
      // the OS
      // (https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations).
      config: { usesNonExemptEncryption: false },
      icon: "./assets/expo.icon",
      usesAppleSignIn: true,
    },
    name: isDevelopmentVariant ? "Ankaa Dev" : "Ankaa",
    orientation: "portrait",
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: SPLASH_IMAGE_WIDTH,
        },
      ],
      "expo-secure-store",
      ["expo-build-properties", { ios: { enableSceneSupport: true } }],
      "expo-apple-authentication",
      ["@react-native-google-signin/google-signin", { iosUrlScheme }],
      ["expo-dev-client", { addGeneratedScheme: isDevelopmentVariant }],
    ],
    scheme: APPLICATION_SCHEMES[appVariant],
    slug: APPLICATION_SLUG,
    userInterfaceStyle: "automatic",
    version: "1.0.0",
    web: {
      favicon: "./assets/images/favicon.png",
      output: "static",
    },
  } satisfies ExpoConfig;
}
