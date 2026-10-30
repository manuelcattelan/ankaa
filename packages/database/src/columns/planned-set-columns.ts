import { INTENSITY_TECHNIQUES } from "@ankaa/core/shared/constants/intensity-techniques";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { boolean, integer, text } from "drizzle-orm/pg-core";

/**
 * The columns of a planned Set, which a Routine's Set and a Workout
 * exercise's copy of it share.
 */
export const plannedSetColumns = {
  amount: integer(),
  intensityTechnique: text({ enum: INTENSITY_TECHNIQUES }),
  isToFailure: boolean().notNull(),
  pauseSeconds: integer(),
  restSeconds: integer(),
  segmentCount: integer(),
  tempo: text(),
  type: text({ enum: SET_TYPES }).notNull(),
  weightPercentage: integer(),
};
