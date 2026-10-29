import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/manuelcattelan/ankaa/blob/main/tooling/eslint/rules/${name}.ts`,
);
