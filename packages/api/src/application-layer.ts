import { Authentication } from "@ankaa/authentication/authentication";
import * as Layer from "effect/Layer";

import { ExerciseApplicationService } from "#/features/exercise/exercise-application-service.ts";
import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

export const applicationLayer = Layer.mergeAll(
  Authentication.layer,
  ExerciseApplicationService.layer,
  RoutineApplicationService.layer,
  WorkoutApplicationService.layer,
);
