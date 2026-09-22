import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { env } from "@/env";

const storeOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: "ankaa",
      storage: {
        getItem: (key) => SecureStore.getItem(key, storeOptions),
        getItemAsync: (key) => SecureStore.getItemAsync(key, storeOptions),
        setItem: (key, value) => SecureStore.setItem(key, value, storeOptions),
        setItemAsync: (key, value) =>
          SecureStore.setItemAsync(key, value, storeOptions),
      },
      storagePrefix: "ankaa",
    }),
    emailOTPClient(),
  ],
});
