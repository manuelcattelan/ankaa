import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";

import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { routineListQueryOptions } from "#/features/routine/queries/routine-list-query-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function Routines() {
  const runtime = useRuntime();

  const routines = useQuery(routineListQueryOptions(runtime));

  const routinesErrorMessage =
    routines.error === null ? null : getTrpcErrorMessage(routines.error);
  const routinesStatusMessage =
    routines.data?.length === 0
      ? ROUTINE_MESSAGES.routineListEmptyStatus
      : routinesErrorMessage;

  return (
    <>
      <LinkButton
        href="/routines/new"
        title={ROUTINE_MESSAGES.newRoutineButton}
      />
      {routines.isPending ? <ActivityIndicator /> : null}
      <StatusMessage message={routinesStatusMessage} />
      {routines.data?.map((routine) => (
        <LinkButton
          href={{
            params: { routineId: routine.id },
            pathname: "/routines/[routineId]",
          }}
          key={routine.id}
          title={routine.name}
        />
      ))}
    </>
  );
}
