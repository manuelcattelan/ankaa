import type { RestPauseSetDraft } from "#/features/routine/core/rest-pause-set-form-schema.ts";

import { restPauseSetFormSchema } from "#/features/routine/core/rest-pause-set-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";

export function RoutineEditorRestPauseSet({
  hasSubmitted,
  onChangeRestPauseSet,
  restPauseSet,
}: {
  hasSubmitted: boolean;
  onChangeRestPauseSet: (restPauseSet: RestPauseSetDraft) => void;
  restPauseSet: RestPauseSetDraft;
}) {
  const restPauseSetFormDecoding = decodeForm({
    hasSubmitted,
    schema: restPauseSetFormSchema,
    values: restPauseSet,
  });
  const pauseSecondsErrorMessage =
    restPauseSetFormDecoding.errorMessages.pauseSeconds;
  const segmentCountErrorMessage =
    restPauseSetFormDecoding.errorMessages.segmentCount;

  return (
    <>
      <TextField
        errorMessage={segmentCountErrorMessage}
        inputMode="numeric"
        label={ROUTINE_MESSAGES.restPauseSetSegmentCountLabel}
        onChangeText={(segmentCount) => {
          onChangeRestPauseSet({ ...restPauseSet, segmentCount });
        }}
        value={restPauseSet.segmentCount}
      />
      <TextField
        errorMessage={pauseSecondsErrorMessage}
        inputMode="numeric"
        label={ROUTINE_MESSAGES.pauseSecondsLabel}
        onChangeText={(pauseSeconds) => {
          onChangeRestPauseSet({ ...restPauseSet, pauseSeconds });
        }}
        value={restPauseSet.pauseSeconds}
      />
    </>
  );
}
