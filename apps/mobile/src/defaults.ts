import type {
  MutationKey,
  QueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { createAppleSignInMutationOptions } from "@/features/authentication/mutations/create-apple-sign-in-mutation-options";
import { createGoogleSignInMutationOptions } from "@/features/authentication/mutations/create-google-sign-in-mutation-options";
import { createOtpCodeRequestMutationOptions } from "@/features/authentication/mutations/create-otp-code-request-mutation-options";
import { createOtpCodeSignInMutationOptions } from "@/features/authentication/mutations/create-otp-code-sign-in-mutation-options";
import { createSignOutMutationOptions } from "@/features/authentication/mutations/create-sign-out-mutation-options";
import { createRoutineDeleteMutationOptions } from "@/features/routine/mutations/create-routine-delete-mutation-options";
import { createRoutineSaveMutationOptions } from "@/features/routine/mutations/create-routine-save-mutation-options";
import { createWorkoutSaveMutationOptions } from "@/features/workout/mutations/create-workout-save-mutation-options";

type MutationDefaultKey = {
  mutationKey: MutationKey;
};

type RegisterMutationDefaultsOptions = {
  queryClient: QueryClient;
  runtime: ApplicationRuntime;
};

type SetMutationDefaultOptions<TData, TError, TVariables, TOnMutateResult> = {
  mutationOptions: MutationDefaultKey &
    UseMutationOptions<TData, TError, TVariables, TOnMutateResult>;
  queryClient: QueryClient;
};

export function registerMutationDefaults({
  queryClient,
  runtime,
}: RegisterMutationDefaultsOptions) {
  setMutationDefault({
    mutationOptions: createAppleSignInMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createGoogleSignInMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createOtpCodeRequestMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createOtpCodeSignInMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createRoutineDeleteMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createRoutineSaveMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createSignOutMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createWorkoutSaveMutationOptions(runtime),
    queryClient,
  });
}

function setMutationDefault<TData, TError, TVariables, TOnMutateResult>({
  mutationOptions,
  queryClient,
}: SetMutationDefaultOptions<TData, TError, TVariables, TOnMutateResult>) {
  queryClient.setMutationDefaults(mutationOptions.mutationKey, mutationOptions);
}
