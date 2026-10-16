import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect } from "react";
import { ActivityIndicator } from "react-native";

import type { Routine } from "@/features/routine/interactors/list-routines";

import { routineListMessages } from "@/features/routine/messages/routine-list-messages";
import { createRoutineListQueryOptions } from "@/features/routine/queries/create-routine-list-query-options";
import { LinkButton } from "@/shared/components/link-button";
import { StatusMessage } from "@/shared/components/status-message";
import { getTrpcErrorMessage } from "@/shared/core/get-trpc-error-message";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";

type RoutineListProperties = {
  children?: ReactNode;
  renderRoutineActions: (routine: Routine) => ReactNode;
};

export function RoutineList({
  children,
  renderRoutineActions,
}: RoutineListProperties) {
  const runtime = useRuntime();

  const routines = useQuery(createRoutineListQueryOptions(runtime));

  const routinesErrorMessage = routines.error
    ? getTrpcErrorMessage(routines.error)
    : undefined;
  const routinesStatusMessage =
    routines.data?.length === 0
      ? routineListMessages.routineListEmptyStatus
      : routinesErrorMessage;

  useEffect(() => {
    if (routinesErrorMessage) {
      runtime.runSync(announceMessage(routinesErrorMessage));
    }
  }, [routinesErrorMessage, runtime]);

  return (
    <>
      {routines.isPending ? <ActivityIndicator /> : null}
      {children}
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
      <LinkButton
        href="/routines/new"
        title={routineListMessages.newRoutineButton}
      />
    </>
  );
}
