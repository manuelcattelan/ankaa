import * as Layer from "effect/Layer";

import { ExerciseApplicationService } from "#/features/exercise/exercise-application-service.ts";
import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

/**
 * The Layer of every Feature's Application Service, which the server's
 * Runtime and the test Runtime share.
 */
export const applicationServicesLayer = Layer.mergeAll(
  ExerciseApplicationService.layer,
  RoutineApplicationService.layer,
  WorkoutApplicationService.layer,
);
