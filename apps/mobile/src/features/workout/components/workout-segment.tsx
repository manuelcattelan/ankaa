import type { WeightUnit } from "@ankaa/core/features/workout/constants/weight";
import type { AmountUnit } from "@ankaa/core/shared/constants/amount";
import type { WeightType } from "@ankaa/core/shared/constants/weight-types";

import type { SegmentDraft } from "#/features/workout/core/segment-form-schema.ts";

import { segmentFormSchema } from "#/features/workout/core/segment-form-schema.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { TextField } from "#/shared/components/text-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";

export function WorkoutSegment({
  amountUnit,
  hasSubmitted,
  number,
  onChange,
  segment,
  weightType,
  weightUnit,
}: {
  amountUnit: AmountUnit;
  hasSubmitted: boolean;
  number: null | number;
  onChange: (segment: SegmentDraft) => void;
  segment: SegmentDraft;
  weightType: WeightType;
  weightUnit: WeightUnit;
}) {
  const segmentFormDecoding = decodeForm({
    hasSubmitted,
    schema: segmentFormSchema,
    values: segment,
  });
  const amountErrorMessage = segmentFormDecoding.errorMessages.amount;
  const weightErrorMessage = segmentFormDecoding.errorMessages.weight;

  return (
    <>
      {number === null ? null : (
        <Text>{WORKOUT_MESSAGES.segmentLabel(number)}</Text>
      )}
      <TextField
        errorMessage={amountErrorMessage}
        inputMode="numeric"
        label={WORKOUT_MESSAGES.amountLabels[amountUnit]}
        onChangeText={(amount) => {
          onChange({ ...segment, amount });
        }}
        value={segment.amount}
      />
      {weightType === "none" ? null : (
        <TextField
          errorMessage={weightErrorMessage}
          inputMode="decimal"
          label={WORKOUT_MESSAGES.weightLabels[weightUnit]}
          onChangeText={(weight) => {
            onChange({ ...segment, weight });
          }}
          value={segment.weight}
        />
      )}
    </>
  );
}
