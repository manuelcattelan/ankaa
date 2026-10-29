import type { Linter } from "eslint";

import js from "@eslint/js";
import json from "@eslint/json";
import eslintPlugin from "@stylistic/eslint-plugin";
import eslintPluginVitest from "@vitest/eslint-plugin";
import eslintConfigPrettierFlat from "eslint-config-prettier/flat";
import eslintPluginImportX from "eslint-plugin-import-x";
import eslintPluginPerfectionist from "eslint-plugin-perfectionist";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import typescriptEslint from "typescript-eslint";

import { plugin } from "#/plugin.ts";

type CreateFeatureIsolationZoneOptions = {
  featureName: string;
  target: string | string[];
};

type CreateGeneratedFilesConfigurationOptions = {
  configuration: Linter.Config[];
  files: string[];
};

export const JAVASCRIPT_FILES = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];

export const TEST_FILES = ["**/*.test.{ts,tsx}"];

const FILENAME_MATCH_EXPORT_EXEMPT_FILES = ["**/*.config.*", "**/*.d.ts"];

export const TEST_HELPER_FILES = ["**/src/shared/testing/**"];

export const RESTRICTED_SYNTAX = [
  {
    message: "Remove this return type and let TypeScript infer it.",
    selector:
      ":function > TSTypeAnnotation.returnType:not([typeAnnotation.type='TSTypePredicate'])",
  },
  {
    message: "Take one parameter. Use an object parameter for more values.",
    selector: "FunctionDeclaration[params.length>1]:not([id.name=/Reducer$/])",
  },
  {
    message: "Move this object type to a named type.",
    selector: "TSTypeLiteral:not(TSTypeAliasDeclaration TSTypeLiteral)",
  },
  {
    message:
      "Use a function declaration for a named function and an arrow function for a function passed as a value.",
    selector:
      "FunctionExpression:not(CallExpression[callee.object.name='Effect'][callee.property.name=/^(fn|gen)$/] > .arguments[generator=true], CallExpression[callee.callee.object.name='Effect'][callee.callee.property.name='fn'] > .arguments[generator=true])",
  },
  {
    message: "Use functions and plain objects instead of a class.",
    selector:
      "ClassDeclaration:not([superClass.callee.object.name='Data'][superClass.callee.property.name='TaggedError'], [superClass.callee.callee.object.name='Context'][superClass.callee.callee.property.name='Service']), ClassExpression",
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
    message: "Use await instead of then(), catch() or finally().",
    selector:
      "CallExpression > MemberExpression.callee[property.name=/^(then|catch|finally)$/]:not([object.name='Effect'][property.name='catch'])",
  },
  {
    message:
      "Import each name from the file that defines it instead of re-exporting a module, because Metro doesn't tree-shake and a barrel file loads every module it re-exports.",
    selector: "ExportAllDeclaration",
  },
  {
    message:
      "Import each name from the file that defines it instead of re-exporting it, because Metro doesn't tree-shake and a barrel file loads every module it re-exports.",
    selector: "ExportNamedDeclaration[source]",
  },
];

export const RESTRICTED_IMPORT_PATTERNS = [
  {
    message:
      "Import your workspace's own files through #/ instead of a relative path, so every import of a file reads the same.",
    regex: String.raw`^\.\.?(?:/|$)`,
  },
  {
    caseSensitive: true,
    message:
      "Import each Effect module from its subpath, such as effect/Schema, because Metro doesn't tree-shake and the root effect import loads every module.",
    regex: "^effect$",
  },
  {
    caseSensitive: true,
    message:
      "Validate with Effect Schema instead of zod, so validation has one library and one vocabulary.",
    regex: "^zod(?:/|$)",
  },
];

const BOOLEAN_PREFIXES = ["is", "has", "can", "should"];
const ASYNC_SUFFIX = { match: false, regex: "Async$" };

const GENERATED_FILES_KEPT_RULE_PREFIXES = ["@stylistic/", "perfectionist/"];

export const FEATURES_PATH = "./src/features";

export const CORE_RESTRICTED_IMPORT_PATTERNS = [
  {
    caseSensitive: true,
    message:
      "Keep core code pure: import only Effect's data modules, such as effect/Schema, from their subpaths.",
    regex: "^effect/(?:Context|Effect|Layer|ManagedRuntime)$",
  },
  {
    caseSensitive: true,
    message:
      "Keep core code pure: move code that needs React, React Native or Expo to the shell.",
    regex:
      "^(?:@expo/|@react-native(?:-[^/]+)?/|expo(?:$|[/-])|react(?:$|[/-]))",
  },
];

export const CORE_FILES = ["**/core/**"];

const CORE_PURITY_RULES: Linter.RulesRecord = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        ...RESTRICTED_IMPORT_PATTERNS,
        ...CORE_RESTRICTED_IMPORT_PATTERNS,
      ],
    },
  ],
};

const corePackagePath = path.resolve(
  import.meta.dirname,
  "../../packages/core",
);

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
      "@ankaa/filename-match-export": "error",
      "@ankaa/naming-convention": [
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
        { format: ["PascalCase"], selector: "typeParameter" },
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
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": [
        "error",
        { checkThenables: true },
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
      "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import-x/extensions": [
        "error",
        "always",
        { checkTypeImports: true, ignorePackages: true },
      ],
      "import-x/no-default-export": "error",
      "import-x/no-relative-packages": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-magic-numbers": "off",
      "no-nested-ternary": "error",
      "no-restricted-imports": [
        "error",
        { patterns: RESTRICTED_IMPORT_PATTERNS },
      ],
      "no-restricted-syntax": ["error", ...RESTRICTED_SYNTAX],
      "no-shadow": "off",
      "object-shorthand": ["error", "properties"],
      "prefer-template": "error",
      "unicorn/catch-error-name": "error",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-exports-in-scripts": "error",
      "unicorn/no-top-level-side-effects": "error",
    },
  },
  {
    files: [[...CORE_FILES, ...JAVASCRIPT_FILES]],
    rules: CORE_PURITY_RULES,
  },
  {
    basePath: corePackagePath,
    files: JAVASCRIPT_FILES,
    rules: CORE_PURITY_RULES,
  },
  {
    files: ["**/*.config.{ts,mts}"],
    rules: { "import-x/no-default-export": "off" },
  },
  {
    files: [...FILENAME_MATCH_EXPORT_EXEMPT_FILES, ...TEST_FILES],
    rules: { "@ankaa/filename-match-export": "off" },
  },
  {
    files: TEST_FILES,
    rules: { "@typescript-eslint/no-magic-numbers": "off" },
  },
  {
    files: TEST_HELPER_FILES,
    rules: { "@typescript-eslint/no-magic-numbers": "off" },
  },
  {
    files: ["tooling/vitest/provided-context.ts"],
    rules: { "@typescript-eslint/consistent-type-definitions": "off" },
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
]);

export const vitestConfiguration = defineConfig({
  extends: [eslintPluginVitest.configs.recommended],
  files: TEST_FILES,
  rules: {
    "vitest/no-conditional-in-test": "error",
    "vitest/no-disabled-tests": "error",
  },
  settings: { vitest: { vitestImports: ["@effect/vitest"] } },
});

export function createFeatureIsolationZone({
  featureName,
  target,
}: CreateFeatureIsolationZoneOptions) {
  return {
    except: [`./${featureName}`],
    from: FEATURES_PATH,
    message:
      "Import nothing from another Feature, so each Feature stays isolated. Move what several Features use to shared/.",
    target,
  };
}

export function createGeneratedFilesConfiguration({
  configuration,
  files,
}: CreateGeneratedFilesConfigurationOptions) {
  const ruleNames = configuration.flatMap((configurationObject) =>
    Object.keys(configurationObject.rules ?? {}),
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

export function getFeatureNames(basePath: string) {
  const featuresAbsolutePath = path.resolve(basePath, FEATURES_PATH);

  if (!existsSync(featuresAbsolutePath)) {
    return [];
  }

  return readdirSync(featuresAbsolutePath, { withFileTypes: true })
    .filter((directoryEntry) => directoryEntry.isDirectory())
    .map((directoryEntry) => directoryEntry.name);
}
