import type * as ManagedRuntime from "effect/ManagedRuntime";

import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";

import { AppleSignIn } from "@/features/authentication/services/apple-sign-in";
import { GoogleSignIn } from "@/features/authentication/services/google-sign-in";
import { Accessibility } from "@/shared/services/accessibility";
import { AuthenticationClient } from "@/shared/services/authentication-client";
import { Crypto } from "@/shared/services/crypto";
import { TrpcClient } from "@/shared/services/trpc-client";

export type ApplicationRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Success<typeof applicationLayer>,
  Layer.Error<typeof applicationLayer>
>;

export const applicationLayer = Layer.mergeAll(
  Accessibility.layer,
  AppleSignIn.layer,
  AuthenticationClient.layer,
  Crypto.layer,
  GoogleSignIn.layer,
  TrpcClient.layer,
).pipe(
  Layer.provide(
    ConfigProvider.layer(
      ConfigProvider.fromUnknown({
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      }),
    ),
  ),
);
