import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getRoutineDeleteErrorMessage } from "#/features/routine/core/get-routine-delete-error-message.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { routineDeleteMutationOptions } from "#/features/routine/mutations/routine-delete-mutation-options.ts";
import { routineListQueryOptions } from "#/features/routine/queries/routine-list-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function RoutineDeleteButton({ routineId }: { routineId: string }) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const deleteRoutine = useMutation({
    ...routineDeleteMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routineListQueryOptions(runtime).queryKey,
      });

      router.dismissTo("/");
    },
  });

  const deleteRoutineErrorMessage =
    deleteRoutine.error === null
      ? null
      : getRoutineDeleteErrorMessage(deleteRoutine.error);

  function handleDeleteRoutine() {
    if (deleteRoutine.isPending) {
      return;
    }

    deleteRoutine.mutate({ id: routineId });
  }

  return (
    <>
      <Button
        isBusy={deleteRoutine.isPending}
        onPress={handleDeleteRoutine}
        title={ROUTINE_MESSAGES.deleteRoutineButton}
      />
      <StatusMessage message={deleteRoutineErrorMessage} />
    </>
  );
}
