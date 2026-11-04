import type { ExpoConfig } from "expo/config";

import { ACCOUNT_DELETION_PATH } from "@ankaa/core/features/authentication/constants/account-deletion-path";
import { APPLICATION_SCHEMES } from "@ankaa/core/features/authentication/constants/application-schemes";
import * as Schema from "effect/Schema";
import * as Struct from "effect/Struct";

import {
  GOOGLE_IOS_CLIENT_ID_SUFFIX,
  googleIosClientIdSchema,
} from "./src/features/authentication/core/google-ios-client-id-schema.ts";
import { apiUrlSchema } from "./src/shared/core/api-url-schema.ts";

type AppVariantConfig = {
  addGeneratedScheme: boolean;
  associatedDomainSuffix: string;
  bundleIdentifier: string;
  name: string;
  scheme: string;
};

const APPLICATION_ID = "app.ankaa";

/**
 * What each variant of the app sets differently in the app config.
 */
const APP_VARIANT_CONFIGS = {
  development: {
    addGeneratedScheme: true,
    associatedDomainSuffix: "?mode=developer",
    bundleIdentifier: "app.ankaa.development",
    name: "Ankaa Dev",
    scheme: APPLICATION_SCHEMES.development,
  },
  production: {
    addGeneratedScheme: false,
    associatedDomainSuffix: "",
    bundleIdentifier: APPLICATION_ID,
    name: "Ankaa",
    scheme: APPLICATION_SCHEMES.production,
  },
} satisfies Record<keyof typeof APPLICATION_SCHEMES, AppVariantConfig>;

/**
 * The fields that identify the project to EAS, which every app config
 * returns.
 */
const PROJECT_IDENTITY = {
  extra: { eas: { projectId: "4cab2d0d-aa34-4dcf-a7a3-f553e3cd99c2" } },
  owner: "ankaa-mobile",
  slug: "ankaa",
};

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
    return { ...PROJECT_IDENTITY };
  }

  const appVariantConfig =
    APP_VARIANT_CONFIGS[
      decodeSetting({
        name: "APP_VARIANT",
        schema: Schema.Literals(Struct.keys(APP_VARIANT_CONFIGS)),
        value: process.env.APP_VARIANT,
      })
    ];

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
    ...PROJECT_IDENTITY,
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
    icon: "./assets/images/icon.png",
    ios: {
      associatedDomains: [
        `applinks:${apiHost}${appVariantConfig.associatedDomainSuffix}`,
      ],
      bundleIdentifier: appVariantConfig.bundleIdentifier,
      // The app uses only the encryption that iOS itself provides, which is
      // exempt from export compliance documentation, so TestFlight needs no
      // answer for each build. This holds only while every cipher comes from
      // the OS
      // (https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations).
      config: { usesNonExemptEncryption: false },
      icon: "./assets/expo.icon",
      usesAppleSignIn: true,
    },
    name: appVariantConfig.name,
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
      [
        "expo-dev-client",
        { addGeneratedScheme: appVariantConfig.addGeneratedScheme },
      ],
    ],
    scheme: appVariantConfig.scheme,
    userInterfaceStyle: "automatic",
    version: "1.0.0",
    web: {
      favicon: "./assets/images/favicon.png",
      output: "static",
    },
  } satisfies ExpoConfig;
}
