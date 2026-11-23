import * as Record from "effect/Record";

/**
 * Follows each Semantic token of a Token family with no Contexts to the
 * Primitive token it names, as the DTCG Resolver Module resolves an alias. A
 * reference is typed as the name of a primitive, so a broken one fails to
 * compile.
 */
export function resolveReferences<
  PrimitiveName extends string,
  Value,
  Role extends string,
>({
  primitives,
  references,
}: {
  primitives: Record<PrimitiveName, Value>;
  references: Record<Role, PrimitiveName>;
}) {
  return Record.map(references, (reference) => primitives[reference]);
}
