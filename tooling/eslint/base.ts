import type { Linter } from "eslint";

import js from "@eslint/js";
import json from "@eslint/json";
import eslintPlugin from "@stylistic/eslint-plugin";
import eslintConfigPrettierFlat from "eslint-config-prettier/flat";
import eslintPluginImportX from "eslint-plugin-import-x";
import eslintPluginPerfectionist from "eslint-plugin-perfectionist";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginYml from "eslint-plugin-yml";
import { defineConfig } from "eslint/config";
import typescriptEslint from "typescript-eslint";

import { plugin } from "./plugin.ts";

type CreateGeneratedFilesConfigurationOptions = {
  configuration: Linter.Config[];
  files: string[];
};

export const JAVASCRIPT_FILES = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];

export const RESTRICTED_SYNTAX = [
  {
    message: "Remove this return type and let TypeScript infer it.",
    selector:
      ":function > TSTypeAnnotation.returnType:not([typeAnnotation.type='TSTypePredicate'])",
  },
  {
    message: "Take one parameter. Use an object parameter for more values.",
    selector: "FunctionDeclaration[params.length>1]",
  },
  {
    message: "Move this object type to a named type.",
    selector: "TSTypeLiteral:not(TSTypeAliasDeclaration TSTypeLiteral)",
  },
  {
    message: "Use !! instead of Boolean().",
    selector: "CallExpression[callee.name='Boolean']",
  },
  {
    message:
      "Use a function declaration for a named function and an arrow function for a function passed as a value.",
    selector: "FunctionExpression",
  },
  {
    message: "Use functions and plain objects instead of a class.",
    selector: "ClassDeclaration, ClassExpression",
  },
  {
    message: "Use a union of string literals instead of an enum.",
    selector: "TSEnumDeclaration",
  },
  {
    message: "Move this type to a separate import type statement.",
    selector: "ImportSpecifier[importKind='type']",
  },
  {
    message: "Move this type to a separate export type statement.",
    selector: "ExportSpecifier[exportKind='type']",
  },
  {
    message: "Keep the object whole and read its properties.",
    selector: "VariableDeclarator > ObjectPattern.id",
  },
  {
    message: "Use await instead of then().",
    selector: "CallExpression > MemberExpression.callee[property.name='then']",
  },
];

const HOOK_STATEMENT_SELECTOR =
  ":matches(VariableDeclaration[declarations.0.init.callee.name=/^use[A-Z]/], VariableDeclaration[declarations.0.init.callee.property.name=/^use[A-Z]/], ExpressionStatement[expression.callee.name=/^use[A-Z]/], ExpressionStatement[expression.callee.property.name=/^use[A-Z]/])";
const ACTION_STATEMENT_SELECTOR =
  ":matches(ExpressionStatement[expression.callee.property.name=/^mutate(Async)?$/], ExpressionStatement[expression.argument.callee.property.name=/^mutate(Async)?$/], ExpressionStatement[expression.callee.object.name='router'], ExpressionStatement[expression.argument.callee.object.name='router'])";
const DECLARATION_STATEMENTS = ["const", "let", "var"];

const GENERIC_NAMES = [
  "callback",
  "current",
  "header",
  "interval",
  "other",
  "result",
  "state",
  "temp",
  "value",
];

const BOOLEAN_PREFIXES = ["is", "has", "can", "should"];
const ASYNC_SUFFIX = { match: false, regex: "Async$" };

const NUMERIC_SEPARATOR_GROUP_LENGTH = 3;
const NUMERIC_SEPARATOR_MINIMUM_DIGITS = 4;

const GENERATED_FILES_KEPT_RULE_PREFIXES = ["@stylistic/", "perfectionist/"];

export const PREVENT_ABBREVIATIONS_OPTIONS = {
  checkShorthandImports: false,
  ignore: ["\\.config$", "^eslint-config-"],
  replacements: {
    auth: { authentication: true },
    config: { configuration: true },
    ms: { milliseconds: true },
  },
};

export const rulesConfiguration = defineConfig([
  {
    files: JAVASCRIPT_FILES,
    plugins: {
      "@ankaa": plugin,
      "@stylistic": eslintPlugin,
      "import-x": eslintPluginImportX,
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "@ankaa/no-comments": "error",
      "@ankaa/no-duplicate-string": "error",
      "@ankaa/no-single-use-string": "error",
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "never", next: "*", prev: "*" },
        { blankLine: "always", next: "*", prev: "import" },
        { blankLine: "always", next: "*", prev: DECLARATION_STATEMENTS },
        { blankLine: "always", next: DECLARATION_STATEMENTS, prev: "*" },
        { blankLine: "always", next: "*", prev: "type" },
        { blankLine: "always", next: "type", prev: "*" },
        { blankLine: "any", next: "type", prev: "type" },
        { blankLine: "always", next: "*", prev: "export" },
        { blankLine: "always", next: "export", prev: "*" },
        { blankLine: "any", next: "export", prev: "export" },
        {
          blankLine: "always",
          next: "*",
          prev: { lineMode: "multiline", selector: "*" },
        },
        {
          blankLine: "always",
          next: { lineMode: "multiline", selector: "*" },
          prev: "*",
        },
        {
          blankLine: "any",
          next: DECLARATION_STATEMENTS,
          prev: DECLARATION_STATEMENTS,
        },
        {
          blankLine: "any",
          next: "*",
          prev: { selector: HOOK_STATEMENT_SELECTOR },
        },
        {
          blankLine: "any",
          next: { selector: HOOK_STATEMENT_SELECTOR },
          prev: "*",
        },
        { blankLine: "any", next: "import", prev: "import" },
        { blankLine: "always", next: "return", prev: "*" },
        {
          blankLine: "always",
          next: "*",
          prev: { selector: ACTION_STATEMENT_SELECTOR },
        },
        {
          blankLine: "always",
          next: { selector: ACTION_STATEMENT_SELECTOR },
          prev: "*",
        },
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          format: ["strictCamelCase"],
          leadingUnderscore: "forbid",
          selector: "default",
          trailingUnderscore: "forbid",
        },
        { format: null, selector: "import" },
        {
          format: ["strictCamelCase"],
          modifiers: ["default"],
          selector: "import",
        },
        {
          format: ["StrictPascalCase"],
          modifiers: ["namespace"],
          selector: "import",
        },
        {
          custom: ASYNC_SUFFIX,
          format: ["strictCamelCase", "StrictPascalCase", "UPPER_CASE"],
          modifiers: ["const", "global"],
          selector: "variable",
        },
        {
          custom: ASYNC_SUFFIX,
          format: ["strictCamelCase"],
          selector: "variable",
        },
        {
          format: ["StrictPascalCase"],
          prefix: BOOLEAN_PREFIXES,
          selector: "variable",
          types: ["boolean"],
        },
        {
          format: ["StrictPascalCase"],
          prefix: BOOLEAN_PREFIXES,
          selector: "parameter",
          types: ["boolean"],
        },
        {
          format: ["StrictPascalCase"],
          prefix: BOOLEAN_PREFIXES,
          selector: "typeProperty",
          types: ["boolean"],
        },
        {
          format: null,
          modifiers: ["destructured"],
          selector: "parameter",
          types: ["boolean"],
        },
        { format: null, modifiers: ["destructured"], selector: "parameter" },
        {
          custom: ASYNC_SUFFIX,
          format: ["strictCamelCase", "StrictPascalCase"],
          selector: "function",
        },
        { format: ["StrictPascalCase"], selector: "typeLike" },
        {
          format: ["StrictPascalCase"],
          prefix: ["T"],
          selector: "typeParameter",
        },
        {
          format: null,
          selector: ["objectLiteralMethod", "objectLiteralProperty"],
        },
        {
          format: null,
          modifiers: ["requiresQuotes"],
          selector: "typeProperty",
        },
      ],
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          detectObjects: true,
          enforceConst: true,
          ignore: [0, 1],
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": "error",
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "func-style": ["error", "declaration"],
      "id-denylist": ["error", ...GENERIC_NAMES],
      "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-magic-numbers": "off",
      "no-nested-ternary": "error",
      "no-restricted-syntax": ["error", ...RESTRICTED_SYNTAX],
      "no-shadow": "off",
      "object-shorthand": ["error", "properties"],
      "prefer-template": "error",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/numeric-separators-style": [
        "error",
        {
          number: {
            groupLength: NUMERIC_SEPARATOR_GROUP_LENGTH,
            minimumDigits: NUMERIC_SEPARATOR_MINIMUM_DIGITS,
          },
          onlyIfContainsSeparator: false,
        },
      ],
      "unicorn/prevent-abbreviations": ["error", PREVENT_ABBREVIATIONS_OPTIONS],
    },
  },
  {
    files: ["tooling/eslint/*.ts", "**/eslint.config.ts"],
    rules: { "@ankaa/no-duplicate-string": "off" },
  },
]);

export const baseConfiguration = defineConfig([
  { linterOptions: { noInlineConfig: true } },
  {
    extends: [
      js.configs.recommended,
      typescriptEslint.configs.recommendedTypeChecked,
      typescriptEslint.configs.stylisticTypeChecked,
      eslintPluginPerfectionist.configs["recommended-natural"],
      eslintConfigPrettierFlat,
    ],
    files: JAVASCRIPT_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  rulesConfiguration,
  {
    extends: ["json/recommended"],
    files: ["**/*.json"],
    language: "json/json",
    plugins: { json },
    rules: {
      "json/sort-keys": [
        "error",
        "asc",
        { allowLineSeparatedGroups: true, natural: true },
      ],
    },
  },
  {
    files: ["**/*.{yaml,yml}"],
    ignores: ["**/pnpm-lock.yaml"],
    language: "yml/yaml",
    plugins: { "@ankaa": plugin, yml: eslintPluginYml },
    rules: { "@ankaa/no-comments": "error" },
  },
]);

export function createGeneratedFilesConfiguration({
  configuration,
  files,
}: CreateGeneratedFilesConfigurationOptions) {
  const ruleNames = configuration.flatMap((entry) =>
    Object.keys(entry.rules ?? {}),
  );
  const disabledRuleNames = ruleNames.filter(
    (ruleName) =>
      !GENERATED_FILES_KEPT_RULE_PREFIXES.some((prefix) =>
        ruleName.startsWith(prefix),
      ),
  );

  return defineConfig({
    files,
    rules: Object.fromEntries(
      disabledRuleNames.map((ruleName) => [ruleName, "off"]),
    ),
  });
}
