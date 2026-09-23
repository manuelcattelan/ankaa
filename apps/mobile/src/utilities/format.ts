type FormatCountOptions = {
  count: number;
  plural: string;
  singular: string;
};

type FormatFieldLabelOptions = {
  errorMessage?: string;
  label: string;
};

export function formatCount({ count, plural, singular }: FormatCountOptions) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatFieldLabel({
  errorMessage,
  label,
}: FormatFieldLabelOptions) {
  return errorMessage ? `${label}, error: ${errorMessage}` : label;
}
