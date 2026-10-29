import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useReducer, useState } from "react";
import { ActivityIndicator } from "react-native";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import type { RecordedSetDraftEntry } from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type { WorkoutExerciseDrafts } from "#/features/workout/core/workout-exercise-drafts-reducer.ts";

import { WorkoutElapsedTime } from "#/features/workout/components/workout-elapsed-time.tsx";
import { WorkoutSection } from "#/features/workout/components/workout-section.tsx";
import { WorkoutStopButton } from "#/features/workout/components/workout-stop-button.tsx";
import { recordedSetDraftsReducer } from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import { workoutExerciseDraftsReducer } from "#/features/workout/core/workout-exercise-drafts-reducer.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { countdownNotificationCancelMutationOptions } from "#/features/workout/mutations/countdown-notification-cancel-mutation-options.ts";
import { countdownNotificationScheduleMutationOptions } from "#/features/workout/mutations/countdown-notification-schedule-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

const NO_RECORDED_SET_DRAFT_ENTRIES: readonly RecordedSetDraftEntry[] = [];

const NO_WORKOUT_EXERCISE_DRAFTS: WorkoutExerciseDrafts = {
  notes: [],
  skips: [],
};

/**
 * Shows the User's Workout in progress, and keeps the Draft of every Set,
 * note and skip that has something to Save, so stopping can be refused while
 * one has, and the one countdown of Rest or a Pause, which starting another
 * replaces.
 */
export function WorkoutScreen() {
  const runtime = useRuntime();

  const [recordedSetDraftEntries, dispatch] = useReducer(
    recordedSetDraftsReducer,
    NO_RECORDED_SET_DRAFT_ENTRIES,
  );
  const [workoutExerciseDrafts, dispatchWorkoutExerciseDrafts] = useReducer(
    workoutExerciseDraftsReducer,
    NO_WORKOUT_EXERCISE_DRAFTS,
  );
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );
  const exerciseLibrary = useQuery(exerciseListQueryOptions(runtime));
  const scheduleCountdownNotification = useMutation(
    countdownNotificationScheduleMutationOptions(runtime),
  );
  const cancelCountdownNotification = useMutation(
    countdownNotificationCancelMutationOptions(runtime),
  );

  const workout = workoutInProgress.data ?? null;
  const exerciseNames = new Map(
    exerciseLibrary.data?.map((exercise) => [exercise.id, exercise.name]),
  );
  const unsavedDraftLabels = [
    ...recordedSetDraftEntries.map((entry) =>
      WORKOUT_MESSAGES.unsavedSetLabel({
        exerciseName: exerciseNames.get(entry.exerciseId) ?? "",
        setNumber: entry.position + 1,
      }),
    ),
    ...workoutExerciseDrafts.notes.map((entry) =>
      WORKOUT_MESSAGES.unsavedNoteLabel(
        exerciseNames.get(entry.exerciseId) ?? "",
      ),
    ),
    ...workoutExerciseDrafts.skips.map((entry) =>
      WORKOUT_MESSAGES.unsavedSkipLabel(
        exerciseNames.get(entry.exerciseId) ?? "",
      ),
    ),
  ];
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (workoutInProgress.error !== null) {
      return getTrpcErrorMessage(workoutInProgress.error);
    }

    return workoutInProgress.isSuccess && workout === null
      ? WORKOUT_MESSAGES.workoutNotInProgressStatus
      : null;
  }

  function handleEndCountdown() {
    setCountdown(null);
  }

  function handleSkipCountdown() {
    setCountdown(null);
    cancelCountdownNotification.mutate();
  }

  function handleStartCountdown(
    startedCountdown: Omit<Countdown, "startTime">,
  ) {
    setCountdown({ ...startedCountdown, startTime: Date.now() });
    scheduleCountdownNotification.mutate({
      ...WORKOUT_MESSAGES.countdownEndNotifications[startedCountdown.kind],
      seconds: startedCountdown.seconds,
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: WORKOUT_MESSAGES.workoutScreenTitle }} />
      <ScrollView>
        {workoutInProgress.isPending ? <ActivityIndicator /> : null}
        <StatusMessage message={statusMessage} />
        {workout === null ? null : (
          <>
            <WorkoutElapsedTime startedAt={workout.startedAt} />
            <WorkoutSection
              countdown={countdown}
              dispatch={dispatch}
              dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
              exerciseGroups={workout.sections.warmUp}
              exerciseNames={exerciseNames}
              onEndCountdown={handleEndCountdown}
              onSkipCountdown={handleSkipCountdown}
              onStartCountdown={handleStartCountdown}
              recordedSetDraftEntries={recordedSetDraftEntries}
              section="warm_up"
              workoutExerciseDrafts={workoutExerciseDrafts}
            />
            <WorkoutSection
              countdown={countdown}
              dispatch={dispatch}
              dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
              exerciseGroups={workout.sections.main}
              exerciseNames={exerciseNames}
              onEndCountdown={handleEndCountdown}
              onSkipCountdown={handleSkipCountdown}
              onStartCountdown={handleStartCountdown}
              recordedSetDraftEntries={recordedSetDraftEntries}
              section="main"
              workoutExerciseDrafts={workoutExerciseDrafts}
            />
            <WorkoutSection
              countdown={countdown}
              dispatch={dispatch}
              dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
              exerciseGroups={workout.sections.coolDown}
              exerciseNames={exerciseNames}
              onEndCountdown={handleEndCountdown}
              onSkipCountdown={handleSkipCountdown}
              onStartCountdown={handleStartCountdown}
              recordedSetDraftEntries={recordedSetDraftEntries}
              section="cool_down"
              workoutExerciseDrafts={workoutExerciseDrafts}
            />
            <WorkoutStopButton
              unsavedDraftLabels={unsavedDraftLabels}
              workoutId={workout.id}
            />
          </>
        )}
      </ScrollView>
    </>
  );
}
