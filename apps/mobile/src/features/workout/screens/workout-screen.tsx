import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useReducer, useState } from "react";
import { ActivityIndicator } from "react-native";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import type { WorkoutDrafts } from "#/features/workout/core/workout-drafts-reducer.ts";

import { WorkoutElapsedTime } from "#/features/workout/components/workout-elapsed-time.tsx";
import { WorkoutSection } from "#/features/workout/components/workout-section.tsx";
import { WorkoutStopButton } from "#/features/workout/components/workout-stop-button.tsx";
import { workoutDraftsReducer } from "#/features/workout/core/workout-drafts-reducer.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { countdownNotificationCancelMutationOptions } from "#/features/workout/mutations/countdown-notification-cancel-mutation-options.ts";
import { countdownNotificationScheduleMutationOptions } from "#/features/workout/mutations/countdown-notification-schedule-mutation-options.ts";
import { WorkoutContext } from "#/features/workout/providers/workout-context.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getExerciseNames } from "#/shared/core/get-exercise-names.ts";
import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

const NO_WORKOUT_DRAFTS: WorkoutDrafts = {
  notes: [],
  recordedSets: [],
  skips: [],
};

const NO_EXERCISE_NAMES: ReadonlyMap<string, string> = new Map();

/**
 * Shows the User's Workout in progress, and keeps the Draft of every Set,
 * note and skip that has something to Save, so stopping can be refused while
 * one has, and the one countdown of Rest or a Pause, which starting another
 * replaces.
 */
export function WorkoutScreen() {
  const runtime = useRuntime();

  const [drafts, dispatch] = useReducer(
    workoutDraftsReducer,
    NO_WORKOUT_DRAFTS,
  );
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );
  const exerciseNames = useQuery({
    ...exerciseListQueryOptions(runtime),
    select: getExerciseNames,
  });
  const scheduleCountdownNotification = useMutation(
    countdownNotificationScheduleMutationOptions(runtime),
  );
  const cancelCountdownNotification = useMutation(
    countdownNotificationCancelMutationOptions(runtime),
  );

  const workout = workoutInProgress.data ?? null;
  const exerciseNamesById = exerciseNames.data ?? NO_EXERCISE_NAMES;
  const unsavedDraftLabels = [
    ...drafts.recordedSets.map((entry) =>
      WORKOUT_MESSAGES.unsavedSetLabel({
        exerciseName: exerciseNamesById.get(entry.exerciseId) ?? "",
        setNumber: entry.position + 1,
      }),
    ),
    ...drafts.notes.map((entry) =>
      WORKOUT_MESSAGES.unsavedNoteLabel(
        exerciseNamesById.get(entry.exerciseId) ?? "",
      ),
    ),
    ...drafts.skips.map((entry) =>
      WORKOUT_MESSAGES.unsavedSkipLabel(
        exerciseNamesById.get(entry.exerciseId) ?? "",
      ),
    ),
  ];
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (workoutInProgress.error !== null) {
      return getTrpcClientErrorMessage(workoutInProgress.error);
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
          <WorkoutContext
            value={{
              countdown,
              dispatch,
              drafts,
              exerciseNames: exerciseNamesById,
              onEndCountdown: handleEndCountdown,
              onSkipCountdown: handleSkipCountdown,
              onStartCountdown: handleStartCountdown,
            }}
          >
            <WorkoutElapsedTime startedAt={workout.startedAt} />
            <WorkoutSection
              exerciseGroups={workout.sections.warmUp}
              section="warm_up"
            />
            <WorkoutSection
              exerciseGroups={workout.sections.main}
              section="main"
            />
            <WorkoutSection
              exerciseGroups={workout.sections.coolDown}
              section="cool_down"
            />
            <WorkoutStopButton
              unsavedDraftLabels={unsavedDraftLabels}
              workoutId={workout.id}
            />
          </WorkoutContext>
        )}
      </ScrollView>
    </>
  );
}
