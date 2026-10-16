import * as Schema from "effect/Schema";

type CreateUniqueValuesFilterOptions<TInput> = {
  getValues: (input: TInput) => readonly unknown[];
};

export function createUniqueValuesFilter<TInput>({
  getValues,
}: CreateUniqueValuesFilterOptions<TInput>) {
  return Schema.makeFilter((input: TInput) => {
    const values = getValues(input);

    return new Set(values).size === values.length || "Must be unique";
  });
}
