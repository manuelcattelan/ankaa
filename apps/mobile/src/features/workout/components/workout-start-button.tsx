import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getWorkoutStartErrorMessage } from "#/features/workout/core/get-workout-start-error-message.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutStartMutationOptions } from "#/features/workout/mutations/workout-start-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useCreateId } from "#/shared/hooks/use-create-id.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

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

  const createId = useCreateId();

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );

  const startWorkout = useMutation({
    ...workoutStartMutationOptions(runtime),
    onSettled: async (data, error) => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      if (error === null) {
        router.push("/workout");
      }
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

    startWorkout.mutate({ id: createId(), routineId });
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
