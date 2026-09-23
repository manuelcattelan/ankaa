import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as ExpoSecureStore from "expo-secure-store";

import { environment } from "@/environment";

const APP_SLUG = "ankaa";

const SECURE_STORE_OPTIONS: ExpoSecureStore.SecureStoreOptions = {
  keychainAccessible: ExpoSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const authenticationClient = createAuthClient({
  baseURL: environment.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: APP_SLUG,
      storage: {
        getItem: (key) => ExpoSecureStore.getItem(key, SECURE_STORE_OPTIONS),
        getItemAsync: (key) =>
          ExpoSecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
        setItem: (key, value) =>
          ExpoSecureStore.setItem(key, value, SECURE_STORE_OPTIONS),
        setItemAsync: (key, value) =>
          ExpoSecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS),
      },
      storagePrefix: APP_SLUG,
    }),
    emailOTPClient(),
  ],
});
