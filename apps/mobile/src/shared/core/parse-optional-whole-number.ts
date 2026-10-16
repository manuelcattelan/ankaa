import { convertUndefinedToNull } from "@/shared/core/convert-undefined-to-null";

export function parseOptionalWholeNumber(wholeNumberText: string) {
  const trimmedWholeNumberText = wholeNumberText.trim();

  return convertUndefinedToNull(
    trimmedWholeNumberText ? Number(trimmedWholeNumberText) : undefined,
  );
}
