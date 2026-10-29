import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

import { getWorkoutStopErrorMessage } from "#/features/workout/core/get-workout-stop-error-message.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutStopMutationOptions } from "#/features/workout/mutations/workout-stop-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

/**
 * Stops the Workout in progress, and refuses to while any Set, note or skip
 * has a Draft left to Save, naming those rows in `unsavedDraftLabels`.
 */
export function WorkoutStopButton({
  unsavedDraftLabels,
  workoutId,
}: {
  unsavedDraftLabels: readonly string[];
  workoutId: string;
}) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const [hasRefusedStop, setHasRefusedStop] = useState(false);

  const stopWorkout = useMutation({
    ...workoutStopMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      router.dismissTo("/");
    },
  });

  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (hasRefusedStop && unsavedDraftLabels.length > 0) {
      return WORKOUT_MESSAGES.draftsUnsavedError([...unsavedDraftLabels]);
    }

    return stopWorkout.error === null
      ? null
      : getWorkoutStopErrorMessage(stopWorkout.error);
  }

  function handleStopWorkout() {
    if (stopWorkout.isPending) {
      return;
    }

    stopWorkout.reset();

    if (unsavedDraftLabels.length > 0) {
      setHasRefusedStop(true);

      return;
    }

    stopWorkout.mutate({ id: workoutId });
  }

  return (
    <>
      <Button
        isBusy={stopWorkout.isPending}
        onPress={handleStopWorkout}
        title={WORKOUT_MESSAGES.stopWorkoutButton}
      />
      <StatusMessage message={statusMessage} />
    </>
  );
}
