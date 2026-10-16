import * as Match from "effect/Match";

import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

import { errorMessages } from "@/shared/messages/error-messages";

export function getWholeNumberValidationErrorMessage(
  wholeNumberValidationOutcome: WholeNumberValidationOutcome,
) {
  return Match.valueTags(wholeNumberValidationOutcome, {
    WholeNumberBelowMinimum: (wholeNumberBelowMinimum) =>
      errorMessages.wholeNumberBelowMinimum(wholeNumberBelowMinimum.minimum),
    WholeNumberOutOfRange: (wholeNumberOutOfRange) =>
      errorMessages.wholeNumberOutOfRange({
        maximum: wholeNumberOutOfRange.maximum,
        minimum: wholeNumberOutOfRange.minimum,
      }),
    WholeNumberValid: () => undefined,
  });
}
