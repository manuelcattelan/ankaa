import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from "@typescript-eslint/utils";

import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import ts from "typescript";

import { createRule } from "../utilities/rule.ts";

type HasFixedContextualTypeOptions = {
  node: StringNode;
  services: ParserServicesWithTypeInformation;
};

type IsCountedStringOptions = HasFixedContextualTypeOptions;

type StringNode = TSESTree.Literal | TSESTree.TemplateLiteral;

const REPEATED_STRING_THRESHOLD = 2;

const IGNORED_PARENT_TYPES: string[] = [
  AST_NODE_TYPES.ExportAllDeclaration,
  AST_NODE_TYPES.ExportNamedDeclaration,
  AST_NODE_TYPES.ImportDeclaration,
  AST_NODE_TYPES.ImportExpression,
  AST_NODE_TYPES.JSXAttribute,
  AST_NODE_TYPES.TSExternalModuleReference,
  AST_NODE_TYPES.TSLiteralType,
  AST_NODE_TYPES.TSModuleDeclaration,
];

export const noDuplicateString = createRule({
  create: (context) => {
    const occurrences = new Map<string, StringNode[]>();
    const services = ESLintUtils.getParserServices(context);

    return {
      Literal: (node) => {
        if (
          typeof node.value === "string" &&
          isCountedString({ node, services })
        ) {
          occurrences.set(node.value, [
            ...(occurrences.get(node.value) ?? []),
            node,
          ]);
        }
      },
      "Program:exit": () => {
        for (const [string, nodes] of occurrences) {
          if (nodes.length < REPEATED_STRING_THRESHOLD) {
            continue;
          }

          for (const node of nodes) {
            if (!isConstantDefinition(node)) {
              context.report({
                data: { count: nodes.length, string },
                messageId: "duplicateString",
                node,
              });
            }
          }
        }
      },
      TemplateLiteral: (node) => {
        const cookedString = node.quasis.at(0)?.value.cooked;

        if (
          node.expressions.length === 0 &&
          cookedString &&
          isCountedString({ node, services })
        ) {
          occurrences.set(cookedString, [
            ...(occurrences.get(cookedString) ?? []),
            node,
          ]);
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        "Move a free-form string that appears more than once into a constant.",
    },
    messages: {
      duplicateString:
        'The string "{{string}}" appears {{count}} times in this file. Move it to a named constant.',
    },
    schema: [],
    type: "suggestion",
  },
  name: "no-duplicate-string",
});

function getComparedNode(node: StringNode) {
  const parent = node.parent;

  if (parent.type === AST_NODE_TYPES.BinaryExpression) {
    return parent.left === node ? parent.right : parent.left;
  }

  if (parent.type === AST_NODE_TYPES.SwitchCase) {
    return parent.parent.discriminant;
  }

  return undefined;
}

function hasFixedContextualType({
  node,
  services,
}: HasFixedContextualTypeOptions) {
  const checker = services.program.getTypeChecker();

  const contextualType = checker.getContextualType(
    services.esTreeNodeToTSNodeMap.get(node),
  );

  if (contextualType) {
    return isFixedStringType(contextualType);
  }

  const comparedNode = getComparedNode(node);

  return (
    !!comparedNode &&
    isFixedStringType(services.getTypeAtLocation(comparedNode))
  );
}

function isConstantDefinition(node: StringNode) {
  return (
    node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
    node.parent.init === node
  );
}

function isCountedString({ node, services }: IsCountedStringOptions) {
  const parent = node.parent;

  if (node.type === AST_NODE_TYPES.Literal && node.value === "") {
    return false;
  }

  if (IGNORED_PARENT_TYPES.includes(parent.type)) {
    return false;
  }

  if (
    (parent.type === AST_NODE_TYPES.Property ||
      parent.type === AST_NODE_TYPES.PropertyDefinition ||
      parent.type === AST_NODE_TYPES.TSPropertySignature) &&
    parent.key === node
  ) {
    return false;
  }

  if (
    parent.type === AST_NODE_TYPES.ExpressionStatement &&
    parent.directive !== undefined
  ) {
    return false;
  }

  return (
    !isTypeofComparison(node) && !hasFixedContextualType({ node, services })
  );
}

function isFixedStringType(type: ts.Type) {
  const types = type.isUnion() ? type.types : [type];

  const hasFreeFormString = types.some(
    (member) => !!(member.flags & ts.TypeFlags.String),
  );
  const hasFixedString = types.some(
    (member) =>
      member.isStringLiteral() ||
      !!(member.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)),
  );

  return hasFixedString && !hasFreeFormString;
}

function isTypeofComparison(node: StringNode) {
  const comparedNode = getComparedNode(node);

  return (
    comparedNode?.type === AST_NODE_TYPES.UnaryExpression &&
    comparedNode.operator === "typeof"
  );
}
