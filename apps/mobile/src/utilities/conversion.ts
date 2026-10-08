import {
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
} from "@ankaa/database/constants";

const WEIGHT_VALUE_PATTERN = /^\d+(\.\d{1,2})?$/;

export function convertUndefinedToNull<TValue>(
  optionalValue: TValue | undefined,
) {
  if (optionalValue === undefined) {
    return null;
  }

  return optionalValue;
}

export function parseOptionalWholeNumber(wholeNumberText: string) {
  const trimmedWholeNumberText = wholeNumberText.trim();

  return convertUndefinedToNull(
    trimmedWholeNumberText ? Number(trimmedWholeNumberText) : undefined,
  );
}

export function parseWeightValue(weightValueText: string) {
  const normalizedWeightValueText = weightValueText.trim().replace(",", ".");
  const weightValue = Number(normalizedWeightValueText);

  const isWeightValueValid =
    WEIGHT_VALUE_PATTERN.test(normalizedWeightValueText) &&
    weightValue >= WEIGHT_VALUE_MINIMUM &&
    weightValue <= WEIGHT_VALUE_MAXIMUM;

  return isWeightValueValid ? weightValue : undefined;
}
