import type { TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

const HOOK_NAME_PATTERN = /^use[A-Z]/;

export function getHookCall(statement: TSESTree.Node) {
  const expression = getStatementExpression(statement);

  if (expression?.type !== AST_NODE_TYPES.CallExpression) {
    return null;
  }

  const name = getCalleeName(expression.callee);

  if (!name || !HOOK_NAME_PATTERN.test(name)) {
    return null;
  }

  return { key: getCalleeKey(expression.callee), name };
}

function getCalleeKey(callee: TSESTree.Expression) {
  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    callee.object.type === AST_NODE_TYPES.Identifier
  ) {
    return `${callee.object.name}.${getCalleeName(callee) ?? ""}`;
  }

  return getCalleeName(callee) ?? "";
}

function getCalleeName(callee: TSESTree.Expression) {
  if (callee.type === AST_NODE_TYPES.Identifier) {
    return callee.name;
  }

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    callee.property.type === AST_NODE_TYPES.Identifier
  ) {
    return callee.property.name;
  }

  return null;
}

function getStatementExpression(statement: TSESTree.Node) {
  if (statement.type === AST_NODE_TYPES.ExpressionStatement) {
    return statement.expression;
  }

  if (
    statement.type !== AST_NODE_TYPES.VariableDeclaration ||
    statement.declarations.length !== 1
  ) {
    return null;
  }

  return statement.declarations.at(0)?.init ?? null;
}
