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
      workoutExercises: r.many.workoutExercise({
        from: r.workout.id,
        to: r.workoutExercise.workoutId,
      }),
    },
    workoutExercise: {
      exercise: r.one.exercise({
        from: r.workoutExercise.exerciseId,
        optional: false,
        to: r.exercise.id,
      }),
      warmUpForWorkoutExercise: r.one.workoutExercise({
        alias: "warmUp",
        from: r.workoutExercise.warmUpForWorkoutExerciseId,
        to: r.workoutExercise.id,
      }),
      warmUpWorkoutExercises: r.many.workoutExercise({
        alias: "warmUp",
        from: r.workoutExercise.id,
        to: r.workoutExercise.warmUpForWorkoutExerciseId,
      }),
      workout: r.one.workout({
        from: r.workoutExercise.workoutId,
        optional: false,
        to: r.workout.id,
      }),
      workoutExerciseSets: r.many.workoutExerciseSet({
        from: r.workoutExercise.id,
        to: r.workoutExerciseSet.workoutExerciseId,
      }),
    },
    workoutExerciseSet: {
      workoutExercise: r.one.workoutExercise({
        from: r.workoutExerciseSet.workoutExerciseId,
        optional: false,
        to: r.workoutExercise.id,
      }),
      workoutExerciseSetSegments: r.many.workoutExerciseSetSegment({
        from: r.workoutExerciseSet.id,
        to: r.workoutExerciseSetSegment.workoutExerciseSetId,
      }),
    },
    workoutExerciseSetSegment: {
      workoutExerciseSet: r.one.workoutExerciseSet({
        from: r.workoutExerciseSetSegment.workoutExerciseSetId,
        optional: false,
        to: r.workoutExerciseSet.id,
      }),
    },
  }),
);
