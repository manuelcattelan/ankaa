import type { ExpoConfig } from "expo/config";

import { ACCOUNT_DELETION_PATH } from "@ankaa/core/features/authentication/constants/account-deletion-path";
import { APPLICATION_SCHEME } from "@ankaa/core/features/authentication/constants/application-scheme";
import * as Schema from "effect/Schema";

import { googleIosClientIdSchema } from "#/features/authentication/core/google-ios-client-id-schema.ts";
import { apiUrlSchema } from "#/shared/core/api-url-schema.ts";

const APPLICATION_ID = "app.ankaa";
const APPLICATION_SLUG = "ankaa";

const GOOGLE_IOS_CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";

const SPLASH_IMAGE_WIDTH = 76;

// @expo/config's readConfigFile prefixes the message of the error that a
// config throws by assigning `error.message`, which SchemaError only has a
// getter for, so it would throw a TypeError that hides which setting is wrong
// (https://github.com/expo/expo/blob/119b336f677fc6ce44658ea34f79ba823028923d/packages/@expo/config/src/getConfig.ts#L16-L23).
function decodeSetting({
  name,
  schema,
  value,
}: {
  name: string;
  schema: Schema.Codec<string>;
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
const apiUrl = decodeSetting({
  name: "EXPO_PUBLIC_API_URL",
  schema: apiUrlSchema,
  value: process.env.EXPO_PUBLIC_API_URL,
});
const apiHost = new URL(apiUrl).host;

const configuration: ExpoConfig = {
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
          { host: apiHost, pathPrefix: ACCOUNT_DELETION_PATH, scheme: "https" },
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
  icon: "./assets/images/icon.png",
  ios: {
    associatedDomains: [`applinks:${apiHost}?mode=developer`],
    bundleIdentifier: APPLICATION_ID,
    icon: "./assets/expo.icon",
    usesAppleSignIn: true,
  },
  name: "Ankaa",
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
  ],
  scheme: APPLICATION_SCHEME,
  slug: APPLICATION_SLUG,
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    favicon: "./assets/images/favicon.png",
    output: "static",
  },
};

export default configuration;
