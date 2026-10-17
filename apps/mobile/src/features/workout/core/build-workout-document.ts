import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";
import type { Exercise } from "@/shared/interactors/list-exercises";
import type { Routine } from "@/shared/interactors/list-routines";

type BuildWorkoutDocumentOptions = {
  exercises: Exercise[];
  routine: Routine;
  startedAt: string;
  userId: string;
  workoutExerciseIds: string[];
  workoutId: string;
};

const WORKOUT_DOCUMENT_INITIAL_VERSION = 1;
const WORKOUT_DOCUMENT_INITIAL_SYNCED_VERSION = 0;

export function buildWorkoutDocument({
  exercises,
  routine,
  startedAt,
  userId,
  workoutExerciseIds,
  workoutId,
}: BuildWorkoutDocumentOptions) {
  const identifiedRoutineExercises = routine.exercises.map(
    (routineExercise, routineExerciseIndex) => ({
      routineExercise,
      workoutExerciseId: workoutExerciseIds[routineExerciseIndex],
    }),
  );

  const workoutDocument: WorkoutDocument = {
    exercises: identifiedRoutineExercises.flatMap(
      ({ routineExercise, workoutExerciseId }) => {
        const libraryExercise = exercises.find(
          (exercise) => exercise.id === routineExercise.exerciseId,
        );

        if (!libraryExercise) {
          return [];
        }

        return [
          {
            amountUnit: libraryExercise.amountUnit,
            exerciseId: routineExercise.exerciseId,
            id: workoutExerciseId,
            note: "",
            routineExerciseNote: routineExercise.note ?? undefined,
            routineExerciseSets: routineExercise.sets.map(
              (routineExerciseSet) => ({
                amount: routineExerciseSet.amount ?? undefined,
                dropSetSegmentCount:
                  routineExerciseSet.dropSetSegmentCount ?? undefined,
                dropSetWeightPercentage:
                  routineExerciseSet.dropSetWeightPercentage ?? undefined,
                isToFailure: routineExerciseSet.isToFailure,
                restPauseRestSeconds:
                  routineExerciseSet.restPauseRestSeconds ?? undefined,
                restPauseSegmentCount:
                  routineExerciseSet.restPauseSegmentCount ?? undefined,
                restSeconds: routineExerciseSet.restSeconds ?? undefined,
                setType: routineExerciseSet.setType,
                tempo: routineExerciseSet.tempo ?? undefined,
                variation: routineExerciseSet.variation ?? undefined,
              }),
            ),
            section: routineExercise.section,
            sets: [],
            skipReasonNote: "",
            superset: routineExercise.superset ?? undefined,
            warmUpForWorkoutExerciseId: identifiedRoutineExercises.find(
              (identifiedRoutineExercise) =>
                identifiedRoutineExercise.routineExercise.id ===
                routineExercise.warmUpForRoutineExerciseId,
            )?.workoutExerciseId,
            weightType: libraryExercise.weightType,
          },
        ];
      },
    ),
    id: workoutId,
    routineId: routine.id,
    startedAt,
    syncedVersion: WORKOUT_DOCUMENT_INITIAL_SYNCED_VERSION,
    userId,
    version: WORKOUT_DOCUMENT_INITIAL_VERSION,
  };

  return workoutDocument;
}
