import { createRule } from "../utilities/rule.ts";

export const noComments = createRule({
  create: (context) => ({
    Program: () => {
      for (const comment of context.sourceCode.getAllComments()) {
        context.report({
          fix: (fixer) => fixer.removeRange(comment.range),
          loc: comment.loc,
          messageId: "comment",
        });
      }
    },
  }),
  defaultOptions: [],
  meta: {
    docs: { description: "Disallow comments in hand-written files." },
    fixable: "code",
    messages: {
      comment: "Remove this comment. The code must explain itself.",
    },
    schema: [],
    type: "suggestion",
  },
  name: "no-comments",
});
