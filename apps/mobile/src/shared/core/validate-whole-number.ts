import * as Data from "effect/Data";
import * as Schema from "effect/Schema";

export type WholeNumberValidationOutcome = Data.TaggedEnum<{
  WholeNumberBelowMinimum: { readonly minimum: number };
  WholeNumberOutOfRange: { readonly maximum: number; readonly minimum: number };
  WholeNumberValid: object;
}>;

type ValidateWholeNumberOptions = {
  isRequired: boolean;
  maximum?: number;
  minimum: number;
  wholeNumberText: string;
};

const WHOLE_NUMBER_PATTERN = /^\d+$/;

const WholeNumberValidationOutcome =
  Data.taggedEnum<WholeNumberValidationOutcome>();

export function validateWholeNumber({
  isRequired,
  maximum,
  minimum,
  wholeNumberText,
}: ValidateWholeNumberOptions) {
  const trimmedWholeNumberText = wholeNumberText.trim();
  const wholeNumberFilter =
    maximum === undefined
      ? Schema.isGreaterThanOrEqualTo(minimum)
      : Schema.isBetween({ maximum, minimum });

  const isWholeNumberValid =
    WHOLE_NUMBER_PATTERN.test(trimmedWholeNumberText) &&
    Schema.is(Schema.Number.check(wholeNumberFilter))(
      Number(trimmedWholeNumberText),
    );

  if ((!trimmedWholeNumberText && !isRequired) || isWholeNumberValid) {
    return WholeNumberValidationOutcome.WholeNumberValid();
  }

  return maximum === undefined
    ? WholeNumberValidationOutcome.WholeNumberBelowMinimum({ minimum })
    : WholeNumberValidationOutcome.WholeNumberOutOfRange({ maximum, minimum });
}
