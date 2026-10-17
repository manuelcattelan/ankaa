import { weightValueFilter } from "@ankaa/core/features/workout/filters/weight-value-filter";
import * as Schema from "effect/Schema";

const WEIGHT_VALUE_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parseWeightValue(weightValueText: string) {
  const normalizedWeightValueText = weightValueText.trim().replace(",", ".");
  const weightValue = Number(normalizedWeightValueText);

  const isWeightValueValid =
    WEIGHT_VALUE_PATTERN.test(normalizedWeightValueText) &&
    Schema.is(Schema.Finite.check(weightValueFilter))(weightValue);

  return isWeightValueValid ? weightValue : undefined;
}
