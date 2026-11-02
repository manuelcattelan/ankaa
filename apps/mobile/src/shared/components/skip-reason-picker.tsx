import type { SkipReason } from "@ankaa/core/shared/constants/skip-reasons";

import { SKIP_REASONS } from "@ankaa/core/shared/constants/skip-reasons";

import { PickerField } from "#/shared/components/picker-field.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const NO_SKIP_REASON = "no_skip_reason";

const SKIP_REASON_OPTIONS = [NO_SKIP_REASON, ...SKIP_REASONS] as const;

/**
 * Lets the User pick the reason of a Skip or of an Absence, which take the
 * same reasons, or no reason, shown as `noReasonLabel`.
 */
export function SkipReasonPicker({
  label,
  noReasonLabel,
  onChangeReason,
  reason,
}: {
  label: string;
  noReasonLabel: string;
  onChangeReason: (changedReason: null | SkipReason) => void;
  reason: null | SkipReason;
}) {
  return (
    <PickerField
      label={label}
      onChangeSelectedOption={(selectedOption) => {
        onChangeReason(
          selectedOption === NO_SKIP_REASON ? null : selectedOption,
        );
      }}
      optionLabels={{
        ...SHARED_MESSAGES.skipReasonLabels,
        [NO_SKIP_REASON]: noReasonLabel,
      }}
      options={SKIP_REASON_OPTIONS}
      selectedOption={reason ?? NO_SKIP_REASON}
    />
  );
}
