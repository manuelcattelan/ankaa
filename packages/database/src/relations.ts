import { defineRelations } from "drizzle-orm";

import * as AuthenticationDatabaseSchema from "#/schema/authentication.ts";
import * as ExerciseDatabaseSchema from "#/schema/exercise.ts";
import * as RoutineDatabaseSchema from "#/schema/routine.ts";
import * as WorkoutDatabaseSchema from "#/schema/workout.ts";

export const relations = defineRelations(
  {
    ...AuthenticationDatabaseSchema,
    ...ExerciseDatabaseSchema,
    ...RoutineDatabaseSchema,
    ...WorkoutDatabaseSchema,
  },
  (r) => ({
    account: {
      user: r.one.user({
        from: r.account.userId,
        optional: false,
        to: r.user.id,
      }),
    },
    exercise: {
      equipment: r.many.exerciseEquipment({
        from: r.exercise.id,
        to: r.exerciseEquipment.exerciseId,
      }),
      muscleGroups: r.many.exerciseMuscleGroup({
        from: r.exercise.id,
        to: r.exerciseMuscleGroup.exerciseId,
      }),
      routineExercises: r.many.routineExercise({
        from: r.exercise.id,
        to: r.routineExercise.exerciseId,
      }),
      workoutExercises: r.many.workoutExercise({
        from: r.exercise.id,
        to: r.workoutExercise.exerciseId,
      }),
    },
    exerciseEquipment: {
      exercise: r.one.exercise({
        from: r.exerciseEquipment.exerciseId,
        optional: false,
        to: r.exercise.id,
      }),
    },
    exerciseMuscleGroup: {
      exercise: r.one.exercise({
        from: r.exerciseMuscleGroup.exerciseId,
        optional: false,
        to: r.exercise.id,
      }),
    },
    routine: {
      days: r.many.routineDay({
        from: r.routine.id,
        to: r.routineDay.routineId,
      }),
      exerciseGroups: r.many.routineExerciseGroup({
        from: r.routine.id,
        to: r.routineExerciseGroup.routineId,
      }),
      user: r.one.user({
        from: r.routine.userId,
        optional: false,
        to: r.user.id,
      }),
      workouts: r.many.workout({
        from: r.routine.id,
        to: r.workout.routineId,
      }),
    },
    routineDay: {
      routine: r.one.routine({
        from: r.routineDay.routineId,
        optional: false,
        to: r.routine.id,
      }),
    },
    routineExercise: {
      exercise: r.one.exercise({
        from: r.routineExercise.exerciseId,
        optional: false,
        to: r.exercise.id,
      }),
      routineExerciseGroup: r.one.routineExerciseGroup({
        from: r.routineExercise.routineExerciseGroupId,
        to: r.routineExerciseGroup.id,
      }),
      sets: r.many.routineExerciseSet({
        from: r.routineExercise.id,
        to: r.routineExerciseSet.routineExerciseId,
      }),
      warmUpExercises: r.many.routineExercise({
        alias: "warmUp",
        from: r.routineExercise.id,
        to: r.routineExercise.warmUpForRoutineExerciseId,
      }),
      warmUpForRoutineExercise: r.one.routineExercise({
        alias: "warmUp",
        from: r.routineExercise.warmUpForRoutineExerciseId,
        to: r.routineExercise.id,
      }),
    },
    routineExerciseGroup: {
      exercises: r.many.routineExercise({
        from: r.routineExerciseGroup.id,
        to: r.routineExercise.routineExerciseGroupId,
      }),
      routine: r.one.routine({
        from: r.routineExerciseGroup.routineId,
        optional: false,
        to: r.routine.id,
      }),
    },
    routineExerciseSet: {
      routineExercise: r.one.routineExercise({
        from: r.routineExerciseSet.routineExerciseId,
        optional: false,
        to: r.routineExercise.id,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        optional: false,
        to: r.user.id,
      }),
    },
    user: {
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      routines: r.many.routine({
        from: r.user.id,
        to: r.routine.userId,
      }),
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      workouts: r.many.workout({
        from: r.user.id,
        to: r.workout.userId,
      }),
    },
    workout: {
      exerciseGroups: r.many.workoutExerciseGroup({
        from: r.workout.id,
        to: r.workoutExerciseGroup.workoutId,
      }),
      routine: r.one.routine({
        from: r.workout.routineId,
        optional: false,
        to: r.routine.id,
      }),
      user: r.one.user({
        from: r.workout.userId,
        optional: false,
        to: r.user.id,
      }),
    },
    workoutExercise: {
      exercise: r.one.exercise({
        from: r.workoutExercise.exerciseId,
        optional: false,
        to: r.exercise.id,
      }),
      plannedSets: r.many.workoutExercisePlannedSet({
        from: r.workoutExercise.id,
        to: r.workoutExercisePlannedSet.workoutExerciseId,
      }),
      recordedSets: r.many.workoutExerciseRecordedSet({
        from: r.workoutExercise.id,
        to: r.workoutExerciseRecordedSet.workoutExerciseId,
      }),
      warmUpExercises: r.many.workoutExercise({
        alias: "warmUp",
        from: r.workoutExercise.id,
        to: r.workoutExercise.warmUpForWorkoutExerciseId,
      }),
      warmUpForWorkoutExercise: r.one.workoutExercise({
        alias: "warmUp",
        from: r.workoutExercise.warmUpForWorkoutExerciseId,
        to: r.workoutExercise.id,
      }),
      workoutExerciseGroup: r.one.workoutExerciseGroup({
        from: r.workoutExercise.workoutExerciseGroupId,
        to: r.workoutExerciseGroup.id,
      }),
    },
    workoutExerciseGroup: {
      exercises: r.many.workoutExercise({
        from: r.workoutExerciseGroup.id,
        to: r.workoutExercise.workoutExerciseGroupId,
      }),
      workout: r.one.workout({
        from: r.workoutExerciseGroup.workoutId,
        optional: false,
        to: r.workout.id,
      }),
    },
    workoutExercisePlannedSet: {
      workoutExercise: r.one.workoutExercise({
        from: r.workoutExercisePlannedSet.workoutExerciseId,
        optional: false,
        to: r.workoutExercise.id,
      }),
    },
    workoutExerciseRecordedSet: {
      segments: r.many.workoutExerciseRecordedSetSegment({
        from: r.workoutExerciseRecordedSet.id,
        to: r.workoutExerciseRecordedSetSegment.workoutExerciseRecordedSetId,
      }),
      workoutExercise: r.one.workoutExercise({
        from: r.workoutExerciseRecordedSet.workoutExerciseId,
        optional: false,
        to: r.workoutExercise.id,
      }),
    },
    workoutExerciseRecordedSetSegment: {
      workoutExerciseRecordedSet: r.one.workoutExerciseRecordedSet({
        from: r.workoutExerciseRecordedSetSegment.workoutExerciseRecordedSetId,
        optional: false,
        to: r.workoutExerciseRecordedSet.id,
      }),
    },
  }),
);
