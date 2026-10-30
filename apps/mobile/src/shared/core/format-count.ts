export function formatCount({
  count,
  plural,
  singular,
}: {
  count: number;
  plural: string;
  singular: string;
}) {
  return `${String(count)} ${count === 1 ? singular : plural}`;
}
