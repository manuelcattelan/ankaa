import { Fragment } from "react";

import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExercise } from "#/features/workout/components/workout-exercise.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const MINIMUM_SUPERSET_EXERCISE_COUNT = 2;

export function WorkoutExerciseGroup({
  exerciseGroup,
  exerciseNames,
}: {
  exerciseGroup: Workout["sections"][keyof Workout["sections"]][number];
  exerciseNames: Map<string, string>;
}) {
  return (
    <>
      {exerciseGroup.exercises.length >= MINIMUM_SUPERSET_EXERCISE_COUNT ? (
        <Text>{SHARED_MESSAGES.supersetLabel}</Text>
      ) : null}
      {exerciseGroup.exercises.map((workoutExercise) => (
        <Fragment key={workoutExercise.id}>
          {"warmUpExercises" in workoutExercise
            ? workoutExercise.warmUpExercises.map((warmUpWorkoutExercise) => (
                <WorkoutExercise
                  exerciseNames={exerciseNames}
                  key={warmUpWorkoutExercise.id}
                  warmUpForExerciseName={
                    exerciseNames.get(workoutExercise.exerciseId) ?? ""
                  }
                  workoutExercise={warmUpWorkoutExercise}
                />
              ))
            : null}
          <WorkoutExercise
            exerciseNames={exerciseNames}
            workoutExercise={workoutExercise}
          />
        </Fragment>
      ))}
    </>
  );
}
