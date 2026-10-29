import { useMutation } from "@tanstack/react-query";

import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
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
      title={AUTHENTICATION_MESSAGES.signOutButton}
    />
  );
}
