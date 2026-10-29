import type { TSESTree } from "@typescript-eslint/utils";

import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "#/utilities/create-rule.ts";

type NamingConventionContext = Parameters<
  typeof typescriptNamingConvention.create
>[0];

type NamingConventionReportDescriptor = Parameters<
  NamingConventionContext["report"]
>[0];

const NAMING_CONVENTION_RULE_NAME = "naming-convention";
const STRICT_PASCAL_CASE_PATTERN = /^(?:[A-Z][\da-z]+)+$/;

const typescriptNamingConvention = getTypescriptNamingConvention();

export const namingConvention = createRule({
  create: (context) =>
    typescriptNamingConvention.create(createTaggedEnumKeyContext(context)),
  meta: {
    ...typescriptNamingConvention.meta,
    docs: {
      description:
        "Enforce @typescript-eslint/naming-convention, but allow the PascalCase keys of a Data.TaggedEnum type argument, as Effect writes its tags.",
    },
  },
  name: NAMING_CONVENTION_RULE_NAME,
});

function createTaggedEnumKeyContext(context: NamingConventionContext) {
  function report(descriptor: NamingConventionReportDescriptor) {
    reportUnlessTaggedEnumKey({ context, descriptor });
  }

  return new Proxy(
    { ...context },
    {
      get: (target, property) => {
        const contextProperty: unknown =
          property === "report" ? report : Reflect.get(context, property);

        return contextProperty;
      },
    },
  );
}

function getTypescriptNamingConvention() {
  const rule = typescriptEslintPlugin.rules[NAMING_CONVENTION_RULE_NAME];

  if (rule === undefined) {
    throw new Error(
      `@typescript-eslint/eslint-plugin has no ${NAMING_CONVENTION_RULE_NAME} rule.`,
    );
  }

  return rule;
}

function isDataTaggedEnum(node: TSESTree.Node | undefined) {
  return (
    node?.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
    node.typeName.left.type === AST_NODE_TYPES.Identifier &&
    node.typeName.left.name === "Data" &&
    node.typeName.right.name === "TaggedEnum"
  );
}

function isPascalCaseTaggedEnumKey(
  descriptor: NamingConventionReportDescriptor,
) {
  if (
    !("node" in descriptor) ||
    descriptor.node.type !== AST_NODE_TYPES.Identifier ||
    !STRICT_PASCAL_CASE_PATTERN.test(descriptor.node.name)
  ) {
    return false;
  }

  const propertySignature = descriptor.node.parent;
  const typeLiteral = propertySignature.parent;
  const typeArguments = typeLiteral?.parent;

  return (
    propertySignature.type === AST_NODE_TYPES.TSPropertySignature &&
    propertySignature.key === descriptor.node &&
    typeLiteral?.type === AST_NODE_TYPES.TSTypeLiteral &&
    typeArguments?.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
    isDataTaggedEnum(typeArguments.parent)
  );
}

function reportUnlessTaggedEnumKey({
  context,
  descriptor,
}: {
  context: NamingConventionContext;
  descriptor: NamingConventionReportDescriptor;
}) {
  if (!isPascalCaseTaggedEnumKey(descriptor)) {
    context.report(descriptor);
  }
}
