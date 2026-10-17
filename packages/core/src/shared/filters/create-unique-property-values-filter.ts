import { createUniqueValuesFilter } from "./create-unique-values-filter.ts";

type CreateUniquePropertyValuesFilterOptions<TPropertyKey extends string> = {
  propertyKey: TPropertyKey;
};

type PropertyRecord<TPropertyKey extends string> = Readonly<
  Record<TPropertyKey, unknown>
>;

export function createUniquePropertyValuesFilter<TPropertyKey extends string>({
  propertyKey,
}: CreateUniquePropertyValuesFilterOptions<TPropertyKey>) {
  return createUniqueValuesFilter({
    getValues: (propertyRecords: readonly PropertyRecord<TPropertyKey>[]) =>
      propertyRecords.map((propertyRecord) => propertyRecord[propertyKey]),
  });
}
