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

type CreateRestrictedImportsConfigurationOptions = {
  basePath?: string;
  files: NonNullable<Linter.Config["files"]>;
  ignores?: string[];
  paths?: RestrictedImportPath[];
  patterns: RestrictedImportPattern[];
};

type RestrictedImportPath = {
  importNames?: string[];
  message: string;
  name: string;
};

type RestrictedImportPattern = (typeof RESTRICTED_IMPORT_PATTERNS)[number];

export const JAVASCRIPT_FILES = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];

export const TEST_FILES = ["**/*.test.{ts,tsx}"];

const FILENAME_MATCH_EXPORT_EXEMPT_FILES = ["**/*.config.*", "**/*.d.ts"];

export const TESTING_FILES = ["**/testing/**"];

const TESTING_IMPORTING_FILES = [
  ...TEST_FILES,
  ...TESTING_FILES,
  "**/vitest.config.ts",
];

const TESTING_IMPORT_PATTERN = {
  message:
    "Import a testing/ file only in a test file, another testing/ file or a Vitest configuration, so test code, such as a fake, never ships in an app.",
  regex: "(?:^|/)testing(?:/|$)",
};

export const TEST_RESTRICTED_SYNTAX = [
  {
    message:
      "Write a test as straight-line code, because a loop repeats the code's logic in the test. Write one test per case.",
    selector:
      "ForStatement, ForInStatement, ForOfStatement, WhileStatement, DoWhileStatement",
  },
  {
    message:
      "Write a test as straight-line code, because forEach repeats the code's logic in the test. Write one test per case.",
    selector: "CallExpression[callee.property.name='forEach']",
  },
  {
    message:
      "Write one test per case with literal values, because a table of cases hides which case a test checks and invites computed expectations.",
    selector:
      "MemberExpression[property.name='each'][object.name=/^(describe|it|test)$/], MemberExpression[property.name='each'][object.object.name=/^(describe|it|test)$/]",
  },
];

const RESTRICTED_MOCK_METHOD_MESSAGE =
  "Swap behavior only through a Service's Layers, because a module mock replaces the code a test should run and breaks when the code is refactored.";

export const RESTRICTED_MOCK_METHODS = {
  doMock: RESTRICTED_MOCK_METHOD_MESSAGE,
  mock: RESTRICTED_MOCK_METHOD_MESSAGE,
};

const RESTRICTED_CALL_MATCHER_MESSAGE =
  "Check what the code did through what a fake recorded or what a later call returns, because a call assertion checks how the code works instead of what it does.";

const RESTRICTED_CALL_MATCHERS = [
  "toBeCalled",
  "toBeCalledTimes",
  "toBeCalledWith",
  "toHaveBeenCalled",
  "toHaveBeenCalledAfter",
  "toHaveBeenCalledBefore",
  "toHaveBeenCalledExactlyOnceWith",
  "toHaveBeenCalledOnce",
  "toHaveBeenCalledTimes",
  "toHaveBeenCalledWith",
];

export const restrictedCallMatchers = Object.fromEntries(
  RESTRICTED_CALL_MATCHERS.flatMap((matcher) => [
    [matcher, RESTRICTED_CALL_MATCHER_MESSAGE],
    [`not.${matcher}`, RESTRICTED_CALL_MATCHER_MESSAGE],
  ]),
);

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
  {
    message:
      "Use null for an empty value, and leave out a parameter, option or prop instead of passing undefined, because null means empty and undefined means missing. Write undefined only to compare with it.",
    selector:
      "Identifier[name='undefined']:not(BinaryExpression[operator=/^[!=]==$/] > Identifier)",
  },
  {
    message:
      "Use Schema.NullOr for a field that can be empty, because empty data is null, and undefined means missing.",
    selector:
      "MemberExpression[object.name='Schema'][property.name=/^(?:optional|optionalKey|UndefinedOr)$/]",
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

const TYPE_WORD_SUFFIX = {
  match: false,
  regex: "(?:Array|Async|List|Promise|String)$",
};

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
          custom: TYPE_WORD_SUFFIX,
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
          custom: TYPE_WORD_SUFFIX,
          format: ["strictCamelCase", "StrictPascalCase", "UPPER_CASE"],
          modifiers: ["const", "global"],
          selector: "variable",
        },
        {
          custom: TYPE_WORD_SUFFIX,
          format: ["strictCamelCase"],
          selector: "variable",
        },
        { format: null, modifiers: ["destructured"], selector: "parameter" },
        {
          custom: TYPE_WORD_SUFFIX,
          format: ["strictCamelCase", "StrictPascalCase"],
          selector: "function",
        },
        {
          custom: TYPE_WORD_SUFFIX,
          format: ["StrictPascalCase"],
          selector: "typeLike",
        },
        // Google's guide writes a type parameter in UpperCamelCase, where a
        // one-letter word such as the T of TData stays one capital, which
        // StrictPascalCase rejects (https://google.github.io/styleguide/tsguide.html#identifiers-type-parameters).
        {
          custom: TYPE_WORD_SUFFIX,
          format: ["PascalCase"],
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
      "no-restricted-syntax": ["error", ...RESTRICTED_SYNTAX],
      "no-shadow": "off",
      "object-shorthand": ["error", "properties"],
      "prefer-template": "error",
      "unicorn/catch-error-name": "error",
      "unicorn/consistent-boolean-name": "error",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-exports-in-scripts": "error",
      "unicorn/no-top-level-side-effects": "error",
      "unicorn/no-useless-undefined": "error",
    },
  },
  createRestrictedImportsConfiguration({
    files: JAVASCRIPT_FILES,
    patterns: RESTRICTED_IMPORT_PATTERNS,
  }),
  createRestrictedImportsConfiguration({
    files: [[...CORE_FILES, ...JAVASCRIPT_FILES]],
    patterns: [
      ...RESTRICTED_IMPORT_PATTERNS,
      ...CORE_RESTRICTED_IMPORT_PATTERNS,
    ],
  }),
  createRestrictedImportsConfiguration({
    basePath: corePackagePath,
    files: JAVASCRIPT_FILES,
    patterns: [
      ...RESTRICTED_IMPORT_PATTERNS,
      ...CORE_RESTRICTED_IMPORT_PATTERNS,
    ],
  }),
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
    files: TESTING_FILES,
    rules: { "@typescript-eslint/no-magic-numbers": "off" },
  },
  {
    files: ["**/testing/provided-context.ts"],
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
    "no-restricted-syntax": [
      "error",
      ...RESTRICTED_SYNTAX,
      ...TEST_RESTRICTED_SYNTAX,
    ],
    "vitest/max-nested-describe": ["error", { max: 1 }],
    "vitest/no-conditional-in-test": "error",
    "vitest/no-disabled-tests": "error",
    "vitest/no-restricted-matchers": ["error", restrictedCallMatchers],
    "vitest/no-restricted-vi-methods": ["error", RESTRICTED_MOCK_METHODS],
    "vitest/require-top-level-describe": "error",
  },
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

/**
 * Bans `patterns` and `paths` in `files`, and imports from a testing/ folder
 * in every one of them that isn't a test file, a testing/ file or a Vitest
 * configuration. ESLint replaces a rule's options instead of merging them,
 * so every configuration object that sets `no-restricted-imports` goes
 * through this function to keep the testing/ ban.
 */
export function createRestrictedImportsConfiguration({
  basePath,
  files,
  ignores = [],
  paths = [],
  patterns,
}: CreateRestrictedImportsConfigurationOptions) {
  const configuration = basePath === undefined ? {} : { basePath };

  return defineConfig([
    {
      ...configuration,
      files,
      ignores,
      rules: { "no-restricted-imports": ["error", { paths, patterns }] },
    },
    {
      ...configuration,
      files,
      ignores: [...ignores, ...TESTING_IMPORTING_FILES],
      rules: {
        "no-restricted-imports": [
          "error",
          { paths, patterns: [...patterns, TESTING_IMPORT_PATTERN] },
        ],
      },
    },
  ]);
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
