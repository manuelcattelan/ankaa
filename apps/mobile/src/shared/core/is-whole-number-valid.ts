import * as Match from "effect/Match";

import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

export function isWholeNumberValid(
  wholeNumberValidationOutcome: undefined | WholeNumberValidationOutcome,
) {
  return (
    wholeNumberValidationOutcome === undefined ||
    Match.valueTags(wholeNumberValidationOutcome, {
      WholeNumberBelowMinimum: () => false,
      WholeNumberOutOfRange: () => false,
      WholeNumberValid: () => true,
    })
  );
}
