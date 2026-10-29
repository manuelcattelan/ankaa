import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { ActivityIndicator } from "react-native";

import type { Routine } from "#/shared/routine.ts";

import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { routineListQueryOptions } from "#/features/routine/queries/routine-list-query-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

/**
 * Lists the Routines of the User, each followed by the actions that
 * `renderRoutineActions` renders for it, such as starting a Workout, which
 * another Feature owns.
 */
export function Routines({
  renderRoutineActions,
}: {
  renderRoutineActions: (routine: Routine) => ReactNode;
}) {
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
        <Fragment key={routine.id}>
          <LinkButton
            href={{
              params: { routineId: routine.id },
              pathname: "/routines/[routineId]",
            }}
            title={routine.name}
          />
          {renderRoutineActions(routine)}
        </Fragment>
      ))}
    </>
  );
}
