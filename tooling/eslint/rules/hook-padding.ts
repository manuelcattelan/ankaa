import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getHookCall } from "../utilities/hook.ts";
import { createRule } from "../utilities/rule.ts";

type HookPaddingContext = Readonly<
  TSESLint.RuleContext<HookPaddingMessageId, []>
>;

type HookPaddingMessageId = "expectedBlankLine" | "unexpectedBlankLine";

type HookPaddingOptions = {
  context: HookPaddingContext;
  statements: TSESTree.Statement[];
};

type StatementPair = {
  next: TSESTree.Statement;
  previous: TSESTree.Statement;
};

const LINE_BREAK = "\n";

export const hookPadding = createRule({
  create: (context) => ({
    BlockStatement: (node) => {
      checkHookPadding({ context, statements: node.body });
    },
  }),
  defaultOptions: [],
  meta: {
    docs: {
      description:
        "Group consecutive calls to the same hook and separate different hooks with a blank line.",
    },
    fixable: "whitespace",
    messages: {
      expectedBlankLine:
        "Add a blank line here. A different hook or statement starts a new group.",
      unexpectedBlankLine:
        "Remove this blank line. Calls to the same hook form one group.",
    },
    schema: [],
    type: "layout",
  },
  name: "hook-padding",
});

function checkHookPadding({ context, statements }: HookPaddingOptions) {
  for (const [index, next] of statements.entries()) {
    if (index === 0) {
      continue;
    }

    const previous = statements[index - 1];
    const previousHook = getHookCall(previous);
    const nextHook = getHookCall(next);

    if (!previousHook && !nextHook) {
      continue;
    }

    const isSameGroup =
      previousHook?.key === nextHook?.key &&
      isSingleLine(previous) &&
      isSingleLine(next);

    const hasBlankLine = hasBlankLineBetween({ next, previous });

    if (isSameGroup && hasBlankLine) {
      context.report({
        fix: (fixer) =>
          fixer.replaceTextRange(
            [previous.range[1], next.range[0]],
            removeBlankLines(
              context.sourceCode.text.slice(previous.range[1], next.range[0]),
            ),
          ),
        messageId: "unexpectedBlankLine",
        node: next,
      });
    }

    if (!isSameGroup && !hasBlankLine) {
      context.report({
        fix: (fixer) => fixer.insertTextAfter(previous, LINE_BREAK),
        messageId: "expectedBlankLine",
        node: next,
      });
    }
  }
}

function hasBlankLineBetween({ next, previous }: StatementPair) {
  return next.loc.start.line - previous.loc.end.line > 1;
}

function isSingleLine(statement: TSESTree.Statement) {
  return statement.loc.start.line === statement.loc.end.line;
}

function removeBlankLines(text: string) {
  return `${LINE_BREAK}${text.slice(text.lastIndexOf(LINE_BREAK) + 1)}`;
}
