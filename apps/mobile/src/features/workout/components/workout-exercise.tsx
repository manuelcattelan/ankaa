import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutPlannedSet } from "#/features/workout/components/workout-planned-set.tsx";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function WorkoutExercise({
  exerciseNames,
  warmUpForExerciseName,
  workoutExercise,
}: {
  exerciseNames: Map<string, string>;
  warmUpForExerciseName?: string;
  workoutExercise: Workout["sections"]["coolDown"][number]["exercises"][number];
}) {
  return (
    <>
      <Text>{exerciseNames.get(workoutExercise.exerciseId)}</Text>
      {warmUpForExerciseName === undefined ? null : (
        <Text>
          {SHARED_MESSAGES.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      )}
      {workoutExercise.plannedNote === null ? null : (
        <Text>
          {WORKOUT_MESSAGES.plannedNoteLabel(workoutExercise.plannedNote)}
        </Text>
      )}
      {workoutExercise.plannedSets.map((plannedSet, plannedSetIndex) => (
        <WorkoutPlannedSet
          amountUnit={workoutExercise.amountUnit}
          key={plannedSet.id}
          plannedSet={plannedSet}
          setNumber={plannedSetIndex + 1}
        />
      ))}
    </>
  );
}
