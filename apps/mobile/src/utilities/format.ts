type FormatCountOptions = {
  count: number;
  plural: string;
  singular: string;
};

export function formatCount({ count, plural, singular }: FormatCountOptions) {
  return `${count} ${count === 1 ? singular : plural}`;
}
