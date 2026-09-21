import { type ExpoConfig } from "expo/config";

const googleIosClientId = /^(.+)\.apps\.googleusercontent\.com$/.exec(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
);
if (!googleIosClientId) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is missing or malformed: it must look like `<id>.apps.googleusercontent.com`.",
  );
}
const iosUrlScheme = `com.googleusercontent.apps.${googleIosClientId[1]}`;
const config: ExpoConfig = {
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      backgroundImage: "./assets/images/android-icon-background.png",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    package: "app.ankaa",
    predictiveBackGestureEnabled: false,
  },
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
  icon: "./assets/images/icon.png",
  ios: {
    bundleIdentifier: "app.ankaa",
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
        imageWidth: 76,
      },
    ],
    "expo-secure-store",
    [
      "expo-build-properties",
      {
        ios: {
          enableSceneSupport: true,
        },
      },
    ],
    "expo-apple-authentication",
    ["@react-native-google-signin/google-signin", { iosUrlScheme }],
  ],
  scheme: "ankaa",
  slug: "ankaa",
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    favicon: "./assets/images/favicon.png",
    output: "static",
  },
};
export default config;
