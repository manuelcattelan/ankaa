import * as Record from "effect/Record";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";

const formatIssue = SchemaIssue.makeFormatterStandardSchemaV1();

/**
 * Decodes a form's values with its Schema into each field's message, or
 * `null` for a valid field, and whether the form is valid. A field that breaks
 * several checks shows the message of the first one.
 */
export function decodeForm<Values extends Readonly<Record<string, unknown>>>({
  schema,
  values,
}: {
  schema: Schema.Codec<unknown, Values>;
  values: Values;
}) {
  const result = Schema.decodeUnknownResult(schema)(values, { errors: "all" });

  const issues = Result.match(result, {
    onFailure: (error) => formatIssue(error.issue).issues,
    onSuccess: () => [],
  });

  return {
    errorMessages: Record.map<keyof Values & string, unknown, null | string>(
      values,
      (value, field) =>
        issues.find((issue) => issue.path?.[0] === field)?.message ?? null,
    ),
    isValid: Result.isSuccess(result),
  };
}
