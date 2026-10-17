import { WEIGHT_VALUE_MINIMUM } from "@ankaa/core/features/workout/constants/weight";

import { parseWeightValue } from "@/features/workout/core/parse-weight-value";

type GetDropSetWeightValueSuggestionOptions = {
  dropSetWeightPercentage: number | undefined;
  previousWeightValueText: string;
};

const PERCENTAGE_TOTAL = 100;
const WEIGHT_VALUE_DECIMAL_PLACES = 2;

export function getDropSetWeightValueSuggestion({
  dropSetWeightPercentage,
  previousWeightValueText,
}: GetDropSetWeightValueSuggestionOptions) {
  const previousWeightValue = parseWeightValue(previousWeightValueText);

  if (
    dropSetWeightPercentage === undefined ||
    previousWeightValue === undefined
  ) {
    return undefined;
  }

  const suggestedWeightValue = Number(
    (
      (previousWeightValue * (PERCENTAGE_TOTAL - dropSetWeightPercentage)) /
      PERCENTAGE_TOTAL
    ).toFixed(WEIGHT_VALUE_DECIMAL_PLACES),
  );

  return suggestedWeightValue >= WEIGHT_VALUE_MINIMUM
    ? suggestedWeightValue.toString()
    : undefined;
}
