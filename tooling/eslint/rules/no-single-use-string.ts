import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utilities/rule.ts";

type CheckSingleUseStringOptions = {
  context: NoSingleUseStringContext;
  node: TSESTree.VariableDeclarator;
};

type NoSingleUseStringContext = Readonly<
  TSESLint.RuleContext<NoSingleUseStringMessageId, []>
>;

type NoSingleUseStringMessageId = "singleUseString";

const SINGLE_USE_COUNT = 1;

export const noSingleUseString = createRule({
  create: (context) => ({
    "VariableDeclaration[kind='const'] > VariableDeclarator": (
      node: TSESTree.VariableDeclarator,
    ) => {
      checkSingleUseString({ context, node });
    },
  }),
  defaultOptions: [],
  meta: {
    docs: {
      description:
        "Write a string where it is used unless the file uses it twice or another file needs it.",
    },
    messages: {
      singleUseString:
        "Inline this string where it is used. Keep a constant only for a string that the file uses twice or that another file imports.",
    },
    schema: [],
    type: "suggestion",
  },
  name: "no-single-use-string",
});

function checkSingleUseString({ context, node }: CheckSingleUseStringOptions) {
  if (
    node.id.type !== AST_NODE_TYPES.Identifier ||
    !isPlainString(node.init) ||
    node.parent.parent.type === AST_NODE_TYPES.ExportNamedDeclaration
  ) {
    return;
  }

  const readReferences = context.sourceCode
    .getDeclaredVariables(node)
    .flatMap((variable) => variable.references)
    .filter((reference) => reference.isRead());

  if (readReferences.length === SINGLE_USE_COUNT) {
    context.report({ messageId: "singleUseString", node });
  }
}

function isPlainString(node: null | TSESTree.Expression) {
  if (node?.type === AST_NODE_TYPES.Literal) {
    return typeof node.value === "string";
  }

  return (
    node?.type === AST_NODE_TYPES.TemplateLiteral &&
    node.expressions.length === 0
  );
}
