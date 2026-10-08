import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { useTrpc } from "@/clients/trpc";
import { Button } from "@/components/button";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { announceMessage } from "@/utilities/accessibility";
import { getTrpcErrorMessage } from "@/utilities/errors";
import { messages } from "@/utilities/messages";

export default function AppScreen() {
  const trpc = useTrpc();

  const routines = useQuery(trpc.routine.list.queryOptions());

  const signOut = useMutation({
    mutationFn: () => authenticationClient.signOut(),
  });

  const routinesErrorMessage = routines.error
    ? getTrpcErrorMessage(routines.error)
    : undefined;
  const routinesStatusMessage =
    routines.data?.length === 0
      ? messages.app.routineListEmptyStatus
      : routinesErrorMessage;

  useEffect(() => {
    if (routinesErrorMessage) {
      announceMessage(routinesErrorMessage);
    }
  }, [routinesErrorMessage]);

  function handleSignOut() {
    if (signOut.isPending) {
      return;
    }

    signOut.mutate();
  }

  return (
    <ScrollView>
      {routines.isPending ? <ActivityIndicator /> : null}
      <StatusMessage message={routinesStatusMessage} />
      {routines.data?.map((routine) => (
        <Link
          asChild
          href={{
            params: { routineId: routine.id },
            pathname: "/routines/[routineId]",
          }}
          key={routine.id}
        >
          <Button title={routine.name} />
        </Link>
      ))}
      <Link asChild href="/routines/new">
        <Button title={messages.app.newRoutineButton} />
      </Link>
      <Button
        isBusy={signOut.isPending}
        onPress={handleSignOut}
        title={messages.app.signOutButton}
      />
    </ScrollView>
  );
}
