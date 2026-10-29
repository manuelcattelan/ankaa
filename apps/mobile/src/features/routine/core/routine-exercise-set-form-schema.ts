import { MINIMUM_REST_SECONDS } from "@ankaa/core/features/routine/constants/minimum-rest-seconds";
import { restSecondsFilter } from "@ankaa/core/features/routine/filters/rest-seconds-filter";
import { MINIMUM_AMOUNT } from "@ankaa/core/shared/constants/amount";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { amountFilter } from "@ankaa/core/shared/filters/amount-filter";
import { tempoFilter } from "@ankaa/core/shared/filters/tempo-filter";
import { idSchema } from "@ankaa/core/shared/schemas/id-schema";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

import { dropSetFormSchema } from "#/features/routine/core/drop-set-form-schema.ts";
import { restPauseSetFormSchema } from "#/features/routine/core/rest-pause-set-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";
import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

export type RoutineExerciseSetDraft =
  typeof routineExerciseSetFormSchema.Encoded;

export const routineExerciseSetFormSchema = Schema.Struct({
  amount: createNullableTextSchema(
    createWholeNumberTextSchema({
      filter: amountFilter,
      message: ROUTINE_MESSAGES.wholeNumberBelowMinimumError(MINIMUM_AMOUNT),
    }),
  ),
  id: idSchema,
  intensityTechnique: Schema.NullOr(
    Schema.Union([dropSetFormSchema, restPauseSetFormSchema]),
  ),
  isToFailure: Schema.Boolean,
  restSeconds: createNullableTextSchema(
    createWholeNumberTextSchema({
      filter: restSecondsFilter,
      message:
        ROUTINE_MESSAGES.wholeNumberBelowMinimumError(MINIMUM_REST_SECONDS),
    }),
  ),
  tempo: createNullableTextSchema(
    Schema.String.pipe(
      Schema.decodeTo(
        Schema.String.check(
          tempoFilter.annotate({ message: ROUTINE_MESSAGES.tempoInvalidError }),
        ),
        SchemaTransformation.toUpperCase(),
      ),
    ),
  ),
  type: Schema.Literals(SET_TYPES),
});
