export function convertUndefinedToNull<TValue>(
  optionalValue: TValue | undefined,
) {
  if (optionalValue === undefined) {
    return null;
  }

  return optionalValue;
}
