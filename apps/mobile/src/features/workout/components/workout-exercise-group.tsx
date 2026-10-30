import { Fragment } from "react";

import type { Workout } from "#/shared/workout.ts";

import { WorkoutExercise } from "#/features/workout/components/workout-exercise.tsx";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { Text } from "#/shared/components/text.tsx";
import { MINIMUM_SUPERSET_EXERCISE_COUNT } from "#/shared/constants/minimum-superset-exercise-count.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Shows the exercises of an Exercise group, each after its Warm-up exercises.
 * A Superset rests only after one Set of each exercise, so only its last
 * exercise offers to start Rest.
 */
export function WorkoutExerciseGroup({
  exerciseGroup,
}: {
  exerciseGroup: Workout["sections"][keyof Workout["sections"]][number];
}) {
  const workoutContext = useWorkoutContext();

  return (
    <>
      {exerciseGroup.exercises.length >= MINIMUM_SUPERSET_EXERCISE_COUNT ? (
        <Text>{SHARED_MESSAGES.supersetLabel}</Text>
      ) : null}
      {exerciseGroup.exercises.map((workoutExercise, index) => (
        <Fragment key={workoutExercise.id}>
          {"warmUpExercises" in workoutExercise
            ? workoutExercise.warmUpExercises.map((warmUpWorkoutExercise) => (
                <WorkoutExercise
                  canStartRest
                  exerciseName={
                    workoutContext.exerciseNames.get(
                      warmUpWorkoutExercise.exerciseId,
                    ) ?? ""
                  }
                  key={warmUpWorkoutExercise.id}
                  warmUpForExerciseName={
                    workoutContext.exerciseNames.get(
                      workoutExercise.exerciseId,
                    ) ?? ""
                  }
                  workoutExercise={warmUpWorkoutExercise}
                />
              ))
            : null}
          <WorkoutExercise
            canStartRest={index === exerciseGroup.exercises.length - 1}
            exerciseName={
              workoutContext.exerciseNames.get(workoutExercise.exerciseId) ?? ""
            }
            workoutExercise={workoutExercise}
          />
        </Fragment>
      ))}
    </>
  );
}
