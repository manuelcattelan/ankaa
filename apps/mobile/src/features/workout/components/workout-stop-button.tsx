import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getWorkoutStopErrorMessage } from "#/features/workout/core/get-workout-stop-error-message.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutStopMutationOptions } from "#/features/workout/mutations/workout-stop-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function WorkoutStopButton({ workoutId }: { workoutId: string }) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const stopWorkout = useMutation({
    ...workoutStopMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      router.dismissTo("/");
    },
  });

  const stopWorkoutErrorMessage =
    stopWorkout.error === null
      ? null
      : getWorkoutStopErrorMessage(stopWorkout.error);

  function handleStopWorkout() {
    if (stopWorkout.isPending) {
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
      <StatusMessage message={stopWorkoutErrorMessage} />
    </>
  );
}
