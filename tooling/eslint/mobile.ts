import eslintConfigExpoFlat from "eslint-config-expo/flat";
import { createNodeResolver } from "eslint-plugin-import-x";
import eslintPluginJest from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";
import path from "node:path";

import {
  baseConfiguration,
  CORE_FILES,
  CORE_RESTRICTED_IMPORT_PATTERNS,
  createFeatureIsolationZone,
  FEATURES_PATH,
  getFeatureNames,
  JAVASCRIPT_FILES,
  nullAllowingRestrictedSyntax,
  RESTRICTED_SYNTAX,
  rulesConfiguration,
  TEST_FILES,
} from "./base.ts";

const MOBILE_RESTRICTED_SYNTAX = [
  {
    message: "Move this number to a named constant.",
    selector:
      "JSXExpressionContainer > Literal[raw=/^[0-9]/]:not([value=0]):not([value=1])",
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
];

const RESOLVED_FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];

const ROUTE_FILES = ["./src/app/!(_layout.tsx)", "./src/app/*/**"];

const ROUTE_IMPORTABLE_SHARED_PATHS = [
  "./shared/components",
  "./shared/screens",
];

const DYNAMIC_ROUTE_FILE_NAME_PATTERN = /^\[[a-z][A-Za-z]*\]\.tsx$/;

const WRAPPED_PRIMITIVES = ["Pressable", "ScrollView", "Text", "TextInput"];

const RELATIVE_IMPORT_PATTERN = {
  group: ["./*", "../*"],
  message: "Import through @/ instead of a relative path.",
};

const ROUTE_PACKAGE_IMPORT_PATTERN = {
  message:
    "Import only screens and components in a route file, and expo-router for its params and navigators. The root layout wires the rest of the app.",
  regex: "^(?!@/|expo-router$|react$)",
};

const WRAPPED_PRIMITIVES_IMPORT = {
  importNames: WRAPPED_PRIMITIVES,
  message: "Use the component with the same name from @/shared/components.",
  name: "react-native",
};

const featureNames = getFeatureNames();

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

export const mobileConfiguration = defineConfig([
  baseConfiguration,
  { extends: [eslintConfigExpoFlat], files: JAVASCRIPT_FILES },
  rulesConfiguration,
  {
    files: JAVASCRIPT_FILES,
    rules: {
      "@ankaa/component-order": "error",
      "@ankaa/hook-padding": "error",
      "@stylistic/jsx-curly-brace-presence": [
        "error",
        { children: "never", props: "never" },
      ],
      "@stylistic/jsx-newline": ["error", { prevent: true }],
      "@stylistic/jsx-self-closing-comp": "error",
      "@typescript-eslint/no-redeclare": "off",
      "import-x/extensions": "off",
      "import-x/no-restricted-paths": [
        "error",
        { zones: [...featureIsolationZones, routeZone] },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [WRAPPED_PRIMITIVES_IMPORT],
          patterns: [RELATIVE_IMPORT_PATTERN],
        },
      ],
      "no-restricted-syntax": [
        "error",
        ...RESTRICTED_SYNTAX,
        ...MOBILE_RESTRICTED_SYNTAX,
      ],
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
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
          tsconfig: { configFile: path.resolve("tsconfig.json") },
        }),
      ],
    },
  },
  {
    files: ["src/app/**"],
    rules: {
      "import-x/no-default-export": "off",
      "unicorn/filename-case": [
        "error",
        { case: "kebabCase", ignore: [DYNAMIC_ROUTE_FILE_NAME_PATTERN] },
      ],
    },
  },
  {
    files: ["src/app/**"],
    ignores: ["src/app/_layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [WRAPPED_PRIMITIVES_IMPORT],
          patterns: [RELATIVE_IMPORT_PATTERN, ROUTE_PACKAGE_IMPORT_PATTERN],
        },
      ],
    },
  },
  {
    files: ["src/shared/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RELATIVE_IMPORT_PATTERN] },
      ],
      "react/jsx-props-no-spreading": "off",
    },
  },
  {
    files: [[...CORE_FILES, ...JAVASCRIPT_FILES]],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            RELATIVE_IMPORT_PATTERN,
            ...CORE_RESTRICTED_IMPORT_PATTERNS,
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/messages/**"],
    rules: { "@ankaa/no-duplicate-string": "off" },
  },
  {
    extends: [eslintPluginJest.configs["flat/recommended"]],
    files: TEST_FILES,
    rules: {
      "jest/no-conditional-in-test": "error",
      "jest/no-disabled-tests": "error",
      "no-restricted-syntax": [
        "error",
        ...nullAllowingRestrictedSyntax,
        ...MOBILE_RESTRICTED_SYNTAX,
      ],
    },
  },
]);
