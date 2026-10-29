import { Authentication } from "@ankaa/authentication/authentication";
import * as Layer from "effect/Layer";

import { ExerciseApplicationService } from "#/features/exercise/exercise-application-service.ts";

export const applicationLayer = Layer.mergeAll(
  Authentication.layer,
  ExerciseApplicationService.layer,
);
