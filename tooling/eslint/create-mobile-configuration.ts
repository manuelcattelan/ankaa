import { fixupConfigRules } from "@eslint/compat";
import eslintConfigExpoFlat from "eslint-config-expo/flat";
import { createNodeResolver } from "eslint-plugin-import-x";
import eslintPluginJest from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";
import path from "node:path";
import typescriptEslint from "typescript-eslint";

import {
  baseConfiguration,
  CORE_FILES,
  CORE_RESTRICTED_IMPORT_PATTERNS,
  createFeatureIsolationZone,
  createRestrictedImportsConfiguration,
  FEATURES_PATH,
  getFeatureNames,
  JAVASCRIPT_FILES,
  RESTRICTED_IMPORT_PATTERNS,
  RESTRICTED_MOCK_METHODS,
  RESTRICTED_SYNTAX,
  restrictedCallMatchers,
  rulesConfiguration,
  TEST_FILES,
  TEST_RESTRICTED_SYNTAX,
} from "#/base.ts";

const ACCESSIBILITY_PROPS_WITH_ARIA_ALIAS = [
  "accessibilityElementsHidden",
  "accessibilityLabel",
  "accessibilityLabelledBy",
  "accessibilityLiveRegion",
  "accessibilityState",
  "accessibilityValue",
  "accessibilityViewIsModal",
];

const MOBILE_RESTRICTED_SYNTAX = [
  {
    message:
      "Use the aria-* prop instead of this accessibility* prop, because React Native documents the aria-* props as its web-standard aliases (https://reactnative.dev/docs/accessibility).",
    selector: `JSXAttribute[name.name=/^(?:${ACCESSIBILITY_PROPS_WITH_ARIA_ALIAS.join("|")})$/]`,
  },
  {
    message: "Move this style to StyleSheet.create.",
    selector: "JSXAttribute[name.name='style'] ObjectExpression",
  },
  {
    message:
      "Pass only a literal or an identifier to this hook. Move any logic into a named function.",
    selector:
      "CallExpression[callee.name=/^(useReducer|useRef|useState)$/] > .arguments:not(Identifier, Literal, MemberExpression)",
  },
  {
    message:
      "Give useState an initial value, such as null for an empty one, because a state left without one starts as undefined, which means missing.",
    selector: "CallExpression[callee.name='useState'][arguments.length=0]",
  },
];

const RESOLVED_FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];

const ROUTE_FILES = ["./src/app/!(_layout.tsx)", "./src/app/*/**"];

const ROUTE_IMPORTABLE_SHARED_PATHS = [
  "./shared/components",
  "./shared/screens",
];

const DYNAMIC_ROUTE_FILE_NAME_PATTERN = /^\[[a-z][A-Za-z]*\]\.tsx$/;

const WRAPPED_PRIMITIVES = ["Pressable", "ScrollView", "Text", "TextInput"];

const ROUTE_PACKAGE_IMPORT_PATTERN = {
  message:
    "Import only screens and components in a route file, and expo-router for its params and navigators. The root layout wires the rest of the app.",
  regex: "^(?!#/|expo-router$|react$)",
};

const MEMOIZATION_IMPORT = {
  importNames: ["memo", "useCallback", "useMemo"],
  message:
    "Let React Compiler memoize instead, because it memoizes every component and hook it compiles (https://react.dev/learn/react-compiler/introduction).",
  name: "react",
};

const WRAPPED_PRIMITIVES_IMPORT = {
  importNames: WRAPPED_PRIMITIVES,
  message: "Use the component with the same name from #/shared/components.",
  name: "react-native",
};

// eslint-config-expo's react and import plugins still call context methods that
// ESLint 10 removed (https://eslint.org/docs/latest/use/migrate-to-10.0.0), so
// fixupConfigRules wraps them until Expo supports ESLint 10. It wraps every
// plugin, so put typescript-eslint's own object back, or ESLint refuses two
// different "@typescript-eslint" plugins.
const eslintConfigExpoFixedUp = fixupConfigRules(eslintConfigExpoFlat).map(
  (configuration) =>
    configuration.plugins?.["@typescript-eslint"] === undefined
      ? configuration
      : {
          ...configuration,
          plugins: {
            ...configuration.plugins,
            "@typescript-eslint": typescriptEslint.plugin,
          },
        },
);

export function createMobileConfiguration({ basePath }: { basePath: string }) {
  const featureNames = getFeatureNames(basePath);

  const featureIsolationZones = featureNames.map((featureName) =>
    createFeatureIsolationZone({
      featureName,
      target: `${FEATURES_PATH}/${featureName}`,
    }),
  );

  const routeZone = {
    except: [
      ...featureNames.flatMap((featureName) => [
        `./features/${featureName}/components`,
        `./features/${featureName}/screens`,
      ]),
      ...ROUTE_IMPORTABLE_SHARED_PATHS,
    ],
    from: "./src",
    message:
      "Import only screens and components in a route file. The root layout wires the rest of the app.",
    target: ROUTE_FILES,
  };

  return defineConfig([
    baseConfiguration,
    { extends: [eslintConfigExpoFixedUp], files: JAVASCRIPT_FILES },
    rulesConfiguration,
    {
      files: JAVASCRIPT_FILES,
      rules: {
        "@ankaa/component-order": "error",
        "@stylistic/jsx-curly-brace-presence": [
          "error",
          { children: "never", props: "never" },
        ],
        "@stylistic/jsx-self-closing-comp": "error",
        "@typescript-eslint/no-redeclare": "off",
        "import-x/extensions": "off",
        "import-x/no-restricted-paths": [
          "error",
          { basePath, zones: [...featureIsolationZones, routeZone] },
        ],
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
        ],
        "react-hooks/todo": "error",
        "react/jsx-boolean-value": ["error", "never"],
        "react/jsx-fragments": ["error", "syntax"],
        "react/jsx-no-leaked-render": [
          "error",
          { validStrategies: ["ternary"] },
        ],
        "react/jsx-no-literals": [
          "error",
          { ignoreProps: true, noStrings: true },
        ],
        "react/jsx-props-no-spreading": "error",
      },
      settings: {
        "import-x/resolver-next": [
          createNodeResolver({
            extensions: RESOLVED_FILE_EXTENSIONS,
            tsconfig: { configFile: path.resolve(basePath, "tsconfig.json") },
          }),
        ],
      },
    },
    createRestrictedImportsConfiguration({
      files: JAVASCRIPT_FILES,
      paths: [MEMOIZATION_IMPORT, WRAPPED_PRIMITIVES_IMPORT],
      patterns: RESTRICTED_IMPORT_PATTERNS,
    }),
    {
      files: ["src/app/**"],
      rules: {
        "@ankaa/filename-match-export": "off",
        "import-x/no-default-export": "off",
        "unicorn/filename-case": [
          "error",
          { case: "kebabCase", ignore: [DYNAMIC_ROUTE_FILE_NAME_PATTERN] },
        ],
      },
    },
    createRestrictedImportsConfiguration({
      files: ["src/app/**"],
      ignores: ["src/app/_layout.tsx"],
      paths: [MEMOIZATION_IMPORT, WRAPPED_PRIMITIVES_IMPORT],
      patterns: [...RESTRICTED_IMPORT_PATTERNS, ROUTE_PACKAGE_IMPORT_PATTERN],
    }),
    createRestrictedImportsConfiguration({
      files: ["src/shared/components/**"],
      paths: [MEMOIZATION_IMPORT],
      patterns: RESTRICTED_IMPORT_PATTERNS,
    }),
    {
      files: ["src/shared/components/**"],
      rules: { "react/jsx-props-no-spreading": "off" },
    },
    createRestrictedImportsConfiguration({
      files: [[...CORE_FILES, ...JAVASCRIPT_FILES]],
      patterns: [
        ...RESTRICTED_IMPORT_PATTERNS,
        ...CORE_RESTRICTED_IMPORT_PATTERNS,
      ],
    }),
    {
      extends: [eslintPluginJest.configs["flat/recommended"]],
      files: TEST_FILES,
      rules: {
        "jest/max-nested-describe": ["error", { max: 1 }],
        "jest/no-conditional-in-test": "error",
        "jest/no-disabled-tests": "error",
        "jest/no-restricted-jest-methods": ["error", RESTRICTED_MOCK_METHODS],
        "jest/no-restricted-matchers": ["error", restrictedCallMatchers],
        "jest/require-top-level-describe": "error",
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ...TEST_RESTRICTED_SYNTAX,
        ],
      },
    },
  ]);
}
