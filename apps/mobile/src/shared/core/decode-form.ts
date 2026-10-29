import * as Record from "effect/Record";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";

const formatIssue = SchemaIssue.makeFormatterStandardSchemaV1();

/**
 * Decodes a form's values with its Schema into the message of a check on the
 * whole form, each field's message, or `null` when there's none, whether the
 * form is valid, and its decoded value, or `null` when it isn't valid. A field
 * that breaks several checks shows the message of the first one, and a check
 * on the whole form runs only once every field is valid.
 */
export function decodeForm<
  Value,
  Values extends Readonly<Record<string, unknown>>,
>({ schema, values }: { schema: Schema.Codec<Value, Values>; values: Values }) {
  const result = Schema.decodeUnknownResult(schema)(values, { errors: "all" });

  const issues = Result.match(result, {
    onFailure: (error) => formatIssue(error.issue).issues,
    onSuccess: () => [],
  });

  return {
    errorMessage:
      issues.find((issue) => (issue.path ?? []).length === 0)?.message ?? null,
    errorMessages: Record.map<keyof Values & string, unknown, null | string>(
      values,
      (value, field) =>
        issues.find((issue) => issue.path?.[0] === field)?.message ?? null,
    ),
    isValid: Result.isSuccess(result),
    value: Result.getOrNull(result),
  };
}
