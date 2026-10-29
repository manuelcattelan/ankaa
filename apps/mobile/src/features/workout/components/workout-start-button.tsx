import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getWorkoutStartErrorMessage } from "#/features/workout/core/get-workout-start-error-message.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutStartMutationOptions } from "#/features/workout/mutations/workout-start-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { createId } from "#/shared/interactors/create-id.ts";

/**
 * Starts a Workout from one Routine, and shows its button only while the
 * User has no Workout in progress. A failed start refetches the Workout in
 * progress, which another device may have started.
 */
export function WorkoutStartButton({
  routineId,
  routineName,
}: {
  routineId: string;
  routineName: string;
}) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );

  const startWorkout = useMutation({
    ...workoutStartMutationOptions(runtime),
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      router.push("/workout");
    },
  });

  const startWorkoutErrorMessage =
    startWorkout.error === null
      ? null
      : getWorkoutStartErrorMessage(startWorkout.error);

  function handleStartWorkout() {
    if (startWorkout.isPending) {
      return;
    }

    startWorkout.mutate({ id: runtime.runSync(createId()), routineId });
  }

  return (
    <>
      {workoutInProgress.data === null ? (
        <Button
          isBusy={startWorkout.isPending}
          onPress={handleStartWorkout}
          title={WORKOUT_MESSAGES.startWorkoutButton(routineName)}
        />
      ) : null}
      <StatusMessage message={startWorkoutErrorMessage} />
    </>
  );
}
