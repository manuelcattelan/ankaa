import type { ExpoConfig } from "expo/config";

const APP_IDENTIFIER = "app.ankaa";
const APP_SLUG = "ankaa";
const GOOGLE_IOS_CLIENT_ID_PATTERN = /^(.+)\.apps\.googleusercontent\.com$/;
const SPLASH_IMAGE_WIDTH = 76;

const googleIosClientIdMatch = GOOGLE_IOS_CLIENT_ID_PATTERN.exec(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
);

if (!googleIosClientIdMatch) {
  throw new Error(
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must match "<id>.apps.googleusercontent.com"',
  );
}

const iosUrlScheme = `com.googleusercontent.apps.${googleIosClientIdMatch[1]}`;

const configuration: ExpoConfig = {
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      backgroundImage: "./assets/images/android-icon-background.png",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    package: APP_IDENTIFIER,
    predictiveBackGestureEnabled: false,
  },
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
  icon: "./assets/images/icon.png",
  ios: {
    bundleIdentifier: APP_IDENTIFIER,
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
  scheme: APP_SLUG,
  slug: APP_SLUG,
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    favicon: "./assets/images/favicon.png",
    output: "static",
  },
};

export default configuration;
