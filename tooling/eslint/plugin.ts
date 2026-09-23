import { componentOrder } from "./rules/component-order.ts";
import { hookPadding } from "./rules/hook-padding.ts";
import { noComments } from "./rules/no-comments.ts";
import { noDuplicateString } from "./rules/no-duplicate-string.ts";

type CompatiblePlugin = {
  meta: { name: string };
};

const rulesPlugin = {
  meta: { name: "@ankaa/eslint" },
  rules: {
    "component-order": componentOrder,
    "hook-padding": hookPadding,
    "no-comments": noComments,
    "no-duplicate-string": noDuplicateString,
  },
};

export const plugin: CompatiblePlugin = rulesPlugin;
