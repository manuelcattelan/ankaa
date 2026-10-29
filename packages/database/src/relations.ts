import { defineRelationsPart } from "drizzle-orm";

import * as AuthenticationDatabaseSchema from "./schema/authentication.ts";
import * as ExerciseDatabaseSchema from "./schema/exercise.ts";
import * as RoutineDatabaseSchema from "./schema/routine.ts";
import * as WorkoutDatabaseSchema from "./schema/workout.ts";

export const relations = {
  ...defineRelationsPart({
    ...AuthenticationDatabaseSchema,
    ...ExerciseDatabaseSchema,
    ...RoutineDatabaseSchema,
    ...WorkoutDatabaseSchema,
  }),
  ...AuthenticationDatabaseSchema.authRelations,
  ...ExerciseDatabaseSchema.exerciseRelations,
  ...RoutineDatabaseSchema.routineRelations,
  ...WorkoutDatabaseSchema.workoutRelations,
};
