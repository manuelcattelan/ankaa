import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native";

import { WorkoutSection } from "#/features/workout/components/workout-section.tsx";
import { WorkoutStopButton } from "#/features/workout/components/workout-stop-button.tsx";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

export function WorkoutScreen() {
  const runtime = useRuntime();

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );
  const exerciseLibrary = useQuery(exerciseListQueryOptions(runtime));

  const workout = workoutInProgress.data ?? null;
  const exerciseNames = new Map(
    exerciseLibrary.data?.map((exercise) => [exercise.id, exercise.name]),
  );
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (workoutInProgress.error !== null) {
      return getTrpcErrorMessage(workoutInProgress.error);
    }

    return workoutInProgress.isSuccess && workout === null
      ? WORKOUT_MESSAGES.workoutNotInProgressStatus
      : null;
  }

  return (
    <>
      <Stack.Screen options={{ title: WORKOUT_MESSAGES.workoutScreenTitle }} />
      <ScrollView>
        {workoutInProgress.isPending ? <ActivityIndicator /> : null}
        <StatusMessage message={statusMessage} />
        {workout === null ? null : (
          <>
            <WorkoutSection
              exerciseGroups={workout.sections.warmUp}
              exerciseNames={exerciseNames}
              section="warm_up"
            />
            <WorkoutSection
              exerciseGroups={workout.sections.main}
              exerciseNames={exerciseNames}
              section="main"
            />
            <WorkoutSection
              exerciseGroups={workout.sections.coolDown}
              exerciseNames={exerciseNames}
              section="cool_down"
            />
            <WorkoutStopButton workoutId={workout.id} />
          </>
        )}
      </ScrollView>
    </>
  );
}
