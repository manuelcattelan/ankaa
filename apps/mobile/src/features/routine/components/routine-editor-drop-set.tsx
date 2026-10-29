import type { DropSetDraft } from "#/features/routine/core/drop-set-form-schema.ts";

import { dropSetFormSchema } from "#/features/routine/core/drop-set-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";

export function RoutineEditorDropSet({
  dropSet,
  hasSubmitted,
  onChangeDropSet,
}: {
  dropSet: DropSetDraft;
  hasSubmitted: boolean;
  onChangeDropSet: (dropSet: DropSetDraft) => void;
}) {
  const dropSetFormDecoding = decodeForm({
    schema: dropSetFormSchema,
    values: dropSet,
  });
  const segmentCountErrorMessage = hasSubmitted
    ? dropSetFormDecoding.errorMessages.segmentCount
    : null;
  const weightPercentageErrorMessage = hasSubmitted
    ? dropSetFormDecoding.errorMessages.weightPercentage
    : null;

  return (
    <>
      <TextField
        errorMessage={segmentCountErrorMessage}
        inputMode="numeric"
        label={ROUTINE_MESSAGES.dropSetSegmentCountLabel}
        onChangeText={(segmentCount) => {
          onChangeDropSet({ ...dropSet, segmentCount });
        }}
        value={dropSet.segmentCount}
      />
      <TextField
        errorMessage={weightPercentageErrorMessage}
        inputMode="numeric"
        label={ROUTINE_MESSAGES.dropSetWeightPercentageLabel}
        onChangeText={(weightPercentage) => {
          onChangeDropSet({ ...dropSet, weightPercentage });
        }}
        value={dropSet.weightPercentage}
      />
    </>
  );
}
