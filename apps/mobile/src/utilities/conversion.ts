import {
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
} from "@ankaa/core/features/workout/constants/weight";

const WEIGHT_VALUE_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parseWeightValue(weightValueText: string) {
  const normalizedWeightValueText = weightValueText.trim().replace(",", ".");
  const weightValue = Number(normalizedWeightValueText);

  const isWeightValueValid =
    WEIGHT_VALUE_PATTERN.test(normalizedWeightValueText) &&
    weightValue >= WEIGHT_VALUE_MINIMUM &&
    weightValue <= WEIGHT_VALUE_MAXIMUM;

  return isWeightValueValid ? weightValue : undefined;
}
