import {
  MAXIMUM_WEIGHT,
  MINIMUM_WEIGHT,
} from "@ankaa/core/features/workout/constants/weight";
import { weightFilter } from "@ankaa/core/features/workout/filters/weight-filter";
import { weightStepFilter } from "@ankaa/core/features/workout/filters/weight-step-filter";
import { MINIMUM_AMOUNT } from "@ankaa/core/shared/constants/amount";
import { amountFilter } from "@ankaa/core/shared/filters/amount-filter";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";
import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

export type SegmentDraft = typeof segmentFormSchema.Encoded;

const WEIGHT_PATTERN = /^[0-9]+(\.[0-9]+)?$/;

const weightInvalidError = WORKOUT_MESSAGES.weightInvalidError({
  maximum: MAXIMUM_WEIGHT,
  minimum: MINIMUM_WEIGHT,
});

export const segmentFormSchema = Schema.Struct({
  amount: createWholeNumberTextSchema({
    filter: amountFilter,
    message: WORKOUT_MESSAGES.amountInvalidError(MINIMUM_AMOUNT),
  }),
  weight: createNullableTextSchema(
    Schema.String.check(
      Schema.isPattern(WEIGHT_PATTERN, { message: weightInvalidError }),
    ).pipe(
      Schema.decodeTo(
        Schema.Number.check(
          weightFilter.annotate({ message: weightInvalidError }),
          weightStepFilter.annotate({ message: weightInvalidError }),
        ),
        SchemaTransformation.numberFromString,
      ),
    ),
  ),
});
