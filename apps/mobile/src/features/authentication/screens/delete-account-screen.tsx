import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { accountDeletionMutationOptions } from "#/features/authentication/mutations/account-deletion-mutation-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Deletes the Account of the link's `token` once the User is signed in. It
 * sits outside the screens that the session guards, so a signed-out User
 * signs in on top of it and comes back to it with the token still in memory.
 */
export function DeleteAccountScreen({ token }: { token: null | string }) {
  const runtime = useRuntime();

  const session = useAuthenticationSession();

  const deleteAccount = useMutation(accountDeletionMutationOptions(runtime));

  const hasSession = session.data !== null;
  const isAccountDeleted = deleteAccount.isSuccess && !hasSession;
  // A deletion request without a token emails a new link instead, so a link
  // without one deletes nothing and asks for no session.
  const deletionToken = token === "" ? null : token;
  const isTokenAwaitingDeletion =
    deletionToken !== null && !session.isPending && deleteAccount.isIdle;
  const statusMessage = getStatusMessage();

  useEffect(() => {
    if (isTokenAwaitingDeletion && !hasSession) {
      router.push("/sign-in");
    }
  }, [hasSession, isTokenAwaitingDeletion]);

  useEffect(() => {
    if (isTokenAwaitingDeletion && hasSession) {
      deleteAccount.mutate({ token: deletionToken });
    }
  }, [deleteAccount, deletionToken, hasSession, isTokenAwaitingDeletion]);

  useEffect(() => {
    if (isAccountDeleted) {
      router.replace({
        params: { isAccountDeleted: "true" },
        pathname: "/sign-in",
      });
    }
  }, [isAccountDeleted]);

  function getStatusMessage() {
    if (deletionToken === null) {
      return AUTHENTICATION_MESSAGES.deleteAccountTokenInvalidError;
    }

    return deleteAccount.error === null
      ? null
      : getAuthenticationErrorMessage(deleteAccount.error);
  }

  return (
    <ScrollView>
      {statusMessage === null ? <ActivityIndicator /> : null}
      <StatusMessage message={statusMessage} />
      {statusMessage === null ? null : (
        <LinkButton href="/" title={SHARED_MESSAGES.goHomeButton} />
      )}
    </ScrollView>
  );
}
