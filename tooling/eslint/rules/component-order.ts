import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { getHookCall } from "../utilities/hook.ts";
import { createRule } from "../utilities/rule.ts";

type ComponentOrderContext = Readonly<
  TSESLint.RuleContext<ComponentOrderMessageId, []>
>;

type ComponentOrderMessageId = "unexpectedOrder";

type ComponentOrderOptions = {
  context: ComponentOrderContext;
  node: FunctionNode;
};

type DependencyOptions = {
  context: ComponentOrderContext;
  node: FunctionNode;
  statements: TSESTree.Statement[];
};

type DescriptorPair = {
  first: StatementDescriptor;
  second: StatementDescriptor;
};

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

type Slot =
  | "context"
  | "data"
  | "derived"
  | "earlyReturn"
  | "effect"
  | "handler"
  | "return"
  | "state";

type StatementDescriptor = {
  dependencies: number[];
  group: string;
  index: number;
  name: string;
  slot: Slot;
  statement: TSESTree.Statement;
};

const SLOTS: Slot[] = [
  "context",
  "state",
  "data",
  "derived",
  "effect",
  "earlyReturn",
  "handler",
  "return",
];

const HOOK_SLOTS: Slot[] = ["context", "state", "data", "effect"];
const DEFAULT_HOOK_SLOT: Slot = "context";
const DEFAULT_STATEMENT_SLOT: Slot = "derived";

const HOOK_SLOTS_BY_NAME: Partial<Record<string, Slot>> = {
  useEffect: "effect",
  useInfiniteQuery: "data",
  useInsertionEffect: "effect",
  useLayoutEffect: "effect",
  useMutation: "data",
  useQueries: "data",
  useQuery: "data",
  useReducer: "state",
  useRef: "state",
  useState: "state",
  useSuspenseInfiniteQuery: "data",
  useSuspenseQueries: "data",
  useSuspenseQuery: "data",
};

const STATEMENT_SLOTS_BY_TYPE: Partial<Record<string, Slot>> = {
  [AST_NODE_TYPES.FunctionDeclaration]: "handler",
  [AST_NODE_TYPES.IfStatement]: "earlyReturn",
  [AST_NODE_TYPES.ReturnStatement]: "return",
};

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export const componentOrder = createRule({
  create: (context) => ({
    ArrowFunctionExpression: (node) => {
      checkComponentOrder({ context, node });
    },
    FunctionDeclaration: (node) => {
      checkComponentOrder({ context, node });
    },
    FunctionExpression: (node) => {
      checkComponentOrder({ context, node });
    },
  }),
  defaultOptions: [],
  meta: {
    docs: {
      description:
        "Order the body of a component or hook as described in apps/mobile/AGENTS.md.",
    },
    messages: {
      unexpectedOrder:
        "Move this statement above line {{line}}. Order: context hooks, state, queries and mutations, derived values, effects, early returns, handlers, returned JSX. Hooks of one kind are sorted by name.",
    },
    schema: [],
    type: "suggestion",
  },
  name: "component-order",
});

function checkComponentOrder({ context, node }: ComponentOrderOptions) {
  if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
    return;
  }

  const statements = node.body.body;

  if (!statements.some((statement) => getHookCall(statement))) {
    return;
  }

  const dependencies = getDependencies({ context, node, statements });

  const descriptors = statements.map((statement, index) => ({
    dependencies: dependencies.at(index) ?? [],
    group: getHookCall(statement)?.key ?? "",
    index,
    name: getDeclaredName(statement),
    slot: getSlot(statement),
    statement,
  }));

  const sortedDescriptors = sortDescriptors(descriptors);

  for (const [index, descriptor] of descriptors.entries()) {
    const sortedDescriptor = sortedDescriptors.at(index);

    if (sortedDescriptor && sortedDescriptor !== descriptor) {
      context.report({
        data: { line: descriptor.statement.loc.start.line },
        messageId: "unexpectedOrder",
        node: sortedDescriptor.statement,
      });

      return;
    }
  }
}

function compareDescriptors({ first, second }: DescriptorPair) {
  const slotDifference = SLOTS.indexOf(first.slot) - SLOTS.indexOf(second.slot);

  if (slotDifference !== 0 || !HOOK_SLOTS.includes(first.slot)) {
    return slotDifference || first.index - second.index;
  }

  return (
    collator.compare(first.group, second.group) ||
    collator.compare(first.name, second.name) ||
    first.index - second.index
  );
}

function getDeclaredName(statement: TSESTree.Statement) {
  if (
    statement.type !== AST_NODE_TYPES.VariableDeclaration ||
    statement.declarations.length !== 1
  ) {
    return "";
  }

  const declarator = statement.declarations.at(0);

  if (declarator?.id.type === AST_NODE_TYPES.Identifier) {
    return declarator.id.name;
  }

  if (declarator?.id.type === AST_NODE_TYPES.ArrayPattern) {
    const element = declarator.id.elements.at(0);

    return element?.type === AST_NODE_TYPES.Identifier ? element.name : "";
  }

  return "";
}

function getDependencies({ context, node, statements }: DependencyOptions) {
  const functionScope = context.sourceCode.getScope(node);
  const dependencies: number[][] = statements.map(() => []);

  for (const [declaringIndex, statement] of statements.entries()) {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
      continue;
    }

    const references = statement.declarations.flatMap((declarator) =>
      context.sourceCode
        .getDeclaredVariables(declarator)
        .flatMap((variable) => variable.references),
    );

    for (const reference of references) {
      const dependentIndex = statements.findIndex(
        (candidate) =>
          candidate.range[0] <= reference.identifier.range[0] &&
          reference.identifier.range[1] <= candidate.range[1],
      );

      const isImmediate =
        reference.from.variableScope === functionScope.variableScope;

      if (isImmediate && dependentIndex > declaringIndex) {
        dependencies[dependentIndex].push(declaringIndex);
      }
    }
  }

  return dependencies;
}

function getSlot(statement: TSESTree.Statement) {
  const hookCall = getHookCall(statement);

  if (hookCall) {
    return HOOK_SLOTS_BY_NAME[hookCall.name] ?? DEFAULT_HOOK_SLOT;
  }

  return STATEMENT_SLOTS_BY_TYPE[statement.type] ?? DEFAULT_STATEMENT_SLOT;
}

function sortDescriptors(descriptors: StatementDescriptor[]) {
  const remaining = [...descriptors];
  const sorted: StatementDescriptor[] = [];

  while (remaining.length > 0) {
    const available = remaining.filter((candidate) =>
      candidate.dependencies.every((dependency) =>
        sorted.some((descriptor) => descriptor.index === dependency),
      ),
    );

    const next =
      available
        .toSorted((first, second) => compareDescriptors({ first, second }))
        .at(0) ?? remaining.at(0);

    if (!next) {
      return sorted;
    }

    sorted.push(next);
    remaining.splice(remaining.indexOf(next), 1);
  }

  return sorted;
}
