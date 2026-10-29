import type { Section } from "@ankaa/core/shared/constants/sections";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import type {
  RecordedSetDraftEntry,
  RecordedSetDraftsAction,
} from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type {
  WorkoutExerciseDrafts,
  WorkoutExerciseDraftsAction,
} from "#/features/workout/core/workout-exercise-drafts-reducer.ts";
import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExerciseGroup } from "#/features/workout/components/workout-exercise-group.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function WorkoutSection({
  countdown,
  dispatch,
  dispatchWorkoutExerciseDrafts,
  exerciseGroups,
  exerciseNames,
  onEndCountdown,
  onStartCountdown,
  recordedSetDraftEntries,
  section,
  workoutExerciseDrafts,
}: {
  countdown: Countdown | null;
  dispatch: (action: RecordedSetDraftsAction) => void;
  dispatchWorkoutExerciseDrafts: (action: WorkoutExerciseDraftsAction) => void;
  exerciseGroups: Workout["sections"][keyof Workout["sections"]];
  exerciseNames: Map<string, string>;
  onEndCountdown: () => void;
  onStartCountdown: (countdown: Omit<Countdown, "startTime">) => void;
  recordedSetDraftEntries: readonly RecordedSetDraftEntry[];
  section: Section;
  workoutExerciseDrafts: WorkoutExerciseDrafts;
}) {
  if (exerciseGroups.length === 0) {
    return null;
  }

  return (
    <>
      <Text>{SHARED_MESSAGES.sectionLabels[section]}</Text>
      {exerciseGroups.map((exerciseGroup) => (
        <WorkoutExerciseGroup
          countdown={countdown}
          dispatch={dispatch}
          dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
          exerciseGroup={exerciseGroup}
          exerciseNames={exerciseNames}
          key={exerciseGroup.id}
          onEndCountdown={onEndCountdown}
          onStartCountdown={onStartCountdown}
          recordedSetDraftEntries={recordedSetDraftEntries}
          workoutExerciseDrafts={workoutExerciseDrafts}
        />
      ))}
    </>
  );
}
