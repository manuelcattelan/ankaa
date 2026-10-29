import type { ExpoConfig } from "expo/config";

const ACCOUNT_DELETION_PATH = "/delete-account";

const APPLICATION_ID = "app.ankaa";
const APPLICATION_SLUG = "ankaa";

const GOOGLE_IOS_CLIENT_ID_PATTERN = /^(.+)\.apps\.googleusercontent\.com$/;

const SPLASH_IMAGE_WIDTH = 76;

const googleIosClientId = GOOGLE_IOS_CLIENT_ID_PATTERN.exec(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
)?.[1];

if (googleIosClientId === undefined) {
  throw new Error(
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must match "<id>.apps.googleusercontent.com"',
  );
}

const iosUrlScheme = `com.googleusercontent.apps.${googleIosClientId}`;

// Account deletion links open the app through Universal Links and App Links on
// the API's own host, which in development is the ngrok domain that
// EXPO_PUBLIC_API_URL points to. `?mode=developer` lets a development build
// associate with that domain without Apple's CDN, once Developer Mode and
// Associated Domains Development are on in the device's settings
// (https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.associated-domains),
// and Android verifies the domain against the debug key's fingerprint in the
// server's assetlinks.json
// (https://developer.android.com/training/app-links/verify-android-applinks).
const apiHost = new URL(process.env.EXPO_PUBLIC_API_URL ?? "").host;

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
  scheme: APPLICATION_SLUG,
  slug: APPLICATION_SLUG,
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    favicon: "./assets/images/favicon.png",
    output: "static",
  },
};

export default configuration;
