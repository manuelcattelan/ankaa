import { messages } from "@/utilities/messages";

type GetWholeNumberValidationErrorOptions = {
  isRequired: boolean;
  maximum?: number;
  minimum: number;
  wholeNumberText: string;
};

const WHOLE_NUMBER_PATTERN = /^\d+$/;

export function getWholeNumberValidationError({
  isRequired,
  maximum,
  minimum,
  wholeNumberText,
}: GetWholeNumberValidationErrorOptions) {
  const trimmedWholeNumberText = wholeNumberText.trim();
  const wholeNumber = Number(trimmedWholeNumberText);

  const isWholeNumberValid =
    WHOLE_NUMBER_PATTERN.test(trimmedWholeNumberText) &&
    wholeNumber >= minimum &&
    (maximum === undefined || wholeNumber <= maximum);

  if ((!trimmedWholeNumberText && !isRequired) || isWholeNumberValid) {
    return undefined;
  }

  return maximum === undefined
    ? messages.error.wholeNumberBelowMinimum(minimum)
    : messages.error.wholeNumberOutOfRange({ maximum, minimum });
}
