import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useReducer } from "react";
import { ActivityIndicator } from "react-native";

import type { RecordedSetDraftEntry } from "#/features/workout/core/recorded-set-drafts-reducer.ts";

import { WorkoutSection } from "#/features/workout/components/workout-section.tsx";
import { WorkoutStopButton } from "#/features/workout/components/workout-stop-button.tsx";
import { recordedSetDraftsReducer } from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

const NO_RECORDED_SET_DRAFT_ENTRIES: readonly RecordedSetDraftEntry[] = [];

/**
 * Shows the User's Workout in progress, and keeps the Draft of every Set
 * that has something to Save, so stopping can be refused while one has.
 */
export function WorkoutScreen() {
  const runtime = useRuntime();

  const [recordedSetDraftEntries, dispatch] = useReducer(
    recordedSetDraftsReducer,
    NO_RECORDED_SET_DRAFT_ENTRIES,
  );

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );
  const exerciseLibrary = useQuery(exerciseListQueryOptions(runtime));

  const workout = workoutInProgress.data ?? null;
  const exerciseNames = new Map(
    exerciseLibrary.data?.map((exercise) => [exercise.id, exercise.name]),
  );
  const unsavedSetLabels = recordedSetDraftEntries.map((entry) =>
    WORKOUT_MESSAGES.unsavedSetLabel({
      exerciseName: exerciseNames.get(entry.exerciseId) ?? "",
      setNumber: entry.position + 1,
    }),
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
              dispatch={dispatch}
              exerciseGroups={workout.sections.warmUp}
              exerciseNames={exerciseNames}
              recordedSetDraftEntries={recordedSetDraftEntries}
              section="warm_up"
            />
            <WorkoutSection
              dispatch={dispatch}
              exerciseGroups={workout.sections.main}
              exerciseNames={exerciseNames}
              recordedSetDraftEntries={recordedSetDraftEntries}
              section="main"
            />
            <WorkoutSection
              dispatch={dispatch}
              exerciseGroups={workout.sections.coolDown}
              exerciseNames={exerciseNames}
              recordedSetDraftEntries={recordedSetDraftEntries}
              section="cool_down"
            />
            <WorkoutStopButton
              unsavedSetLabels={unsavedSetLabels}
              workoutId={workout.id}
            />
          </>
        )}
      </ScrollView>
    </>
  );
}
