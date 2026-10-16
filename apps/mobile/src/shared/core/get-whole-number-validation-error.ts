import * as Schema from "effect/Schema";

import { messages } from "@/utilities/messages";

type GetWholeNumberValidationErrorOptions = {
  isRequired: boolean;
  maximum?: number;
  minimum: number;
  wholeNumberFilter: WholeNumberFilter;
  wholeNumberText: string;
};

type WholeNumberFilter = Parameters<typeof Schema.Number.check>[0];

const WHOLE_NUMBER_PATTERN = /^\d+$/;

export function getWholeNumberValidationError({
  isRequired,
  maximum,
  minimum,
  wholeNumberFilter,
  wholeNumberText,
}: GetWholeNumberValidationErrorOptions) {
  const trimmedWholeNumberText = wholeNumberText.trim();
  const wholeNumber = Number(trimmedWholeNumberText);

  const isWholeNumberValid =
    WHOLE_NUMBER_PATTERN.test(trimmedWholeNumberText) &&
    Schema.is(Schema.Number.check(wholeNumberFilter))(wholeNumber);

  if ((!trimmedWholeNumberText && !isRequired) || isWholeNumberValid) {
    return undefined;
  }

  return maximum === undefined
    ? messages.error.wholeNumberBelowMinimum(minimum)
    : messages.error.wholeNumberOutOfRange({ maximum, minimum });
}
