import { useMutation } from "@tanstack/react-query";

import { SIGN_OUT_BUTTON_MESSAGES } from "#/features/authentication/messages/sign-out-button-messages.ts";
import { signOutMutationOptions } from "#/features/authentication/mutations/sign-out-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function SignOutButton() {
  const runtime = useRuntime();

  const signOut = useMutation(signOutMutationOptions(runtime));

  function handleSignOut() {
    if (signOut.isPending) {
      return;
    }

    signOut.mutate();
  }

  return (
    <Button
      isBusy={signOut.isPending}
      onPress={handleSignOut}
      title={SIGN_OUT_BUTTON_MESSAGES.signOutButton}
    />
  );
}
