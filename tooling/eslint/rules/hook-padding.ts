import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getHookCall } from "../utilities/hook.ts";
import { createRule } from "../utilities/rule.ts";

type CheckHookPaddingOptions = {
  context: HookPaddingContext;
  statements: TSESTree.Statement[];
};

type HasBlankLineBetweenOptions = {
  next: TSESTree.Statement;
  previous: TSESTree.Statement;
};

type HookPaddingContext = Readonly<
  TSESLint.RuleContext<HookPaddingMessageId, []>
>;

type HookPaddingMessageId = "expectedBlankLine";

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
        "Separate a call to a hook from a call to a different hook or from another statement with a blank line.",
    },
    fixable: "whitespace",
    messages: {
      expectedBlankLine:
        "Add a blank line here. A different hook or statement starts a new group.",
    },
    schema: [],
    type: "layout",
  },
  name: "hook-padding",
});

function checkHookPadding({ context, statements }: CheckHookPaddingOptions) {
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

    if (
      previousHook?.key !== nextHook?.key &&
      !hasBlankLineBetween({ next, previous })
    ) {
      context.report({
        fix: (fixer) => fixer.insertTextAfter(previous, "\n"),
        messageId: "expectedBlankLine",
        node: next,
      });
    }
  }
}

function hasBlankLineBetween({ next, previous }: HasBlankLineBetweenOptions) {
  return next.loc.start.line - previous.loc.end.line > 1;
}
