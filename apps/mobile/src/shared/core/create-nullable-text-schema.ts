import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

/**
 * Builds the Schema of a text field that may stay empty: blank text decodes
 * to `null`, any other text to `schema`'s value, and `null` encodes back to
 * empty text.
 */
export function createNullableTextSchema<TValue>(
  schema: Schema.Codec<TValue, string>,
) {
  return Schema.Trim.pipe(
    Schema.decodeTo(
      Schema.NullOr(schema),
      SchemaTransformation.transform({
        decode: (text: string) => (text === "" ? null : text),
        encode: (text: null | string) => text ?? "",
      }),
    ),
  );
}
