import { componentOrder } from "#/rules/component-order.ts";
import { filenameMatchExport } from "#/rules/filename-match-export.ts";
import { namingConvention } from "#/rules/naming-convention.ts";

type CompatiblePlugin = {
  meta: { name: string };
};

const rulesPlugin = {
  meta: { name: "@ankaa/eslint" },
  rules: {
    "component-order": componentOrder,
    "filename-match-export": filenameMatchExport,
    "naming-convention": namingConvention,
  },
};

export const plugin: CompatiblePlugin = rulesPlugin;
