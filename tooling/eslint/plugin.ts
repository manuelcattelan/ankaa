import { componentOrder } from "./rules/component-order.ts";
import { hookPadding } from "./rules/hook-padding.ts";
import { noComments } from "./rules/no-comments.ts";
import { noDuplicateString } from "./rules/no-duplicate-string.ts";
import { noSingleUseString } from "./rules/no-single-use-string.ts";

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
    "no-single-use-string": noSingleUseString,
  },
};

export const plugin: CompatiblePlugin = rulesPlugin;
