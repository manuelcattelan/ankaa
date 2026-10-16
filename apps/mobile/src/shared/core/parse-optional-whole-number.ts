import { convertUndefinedToNull } from "@/shared/core/convert-undefined-to-null";

export function parseOptionalWholeNumber(wholeNumberText: string | undefined) {
  const trimmedWholeNumberText = wholeNumberText?.trim();

  return convertUndefinedToNull(
    trimmedWholeNumberText ? Number(trimmedWholeNumberText) : undefined,
  );
}
