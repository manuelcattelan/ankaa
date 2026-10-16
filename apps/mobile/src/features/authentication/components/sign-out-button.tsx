import { useMutation } from "@tanstack/react-query";

import { signOutButtonMessages } from "@/features/authentication/messages/sign-out-button-messages";
import { createSignOutMutationOptions } from "@/features/authentication/mutations/create-sign-out-mutation-options";
import { Button } from "@/shared/components/button";
import { useRuntime } from "@/shared/hooks/use-runtime";

export function SignOutButton() {
  const runtime = useRuntime();

  const signOut = useMutation(createSignOutMutationOptions(runtime));

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
      title={signOutButtonMessages.signOutButton}
    />
  );
}
