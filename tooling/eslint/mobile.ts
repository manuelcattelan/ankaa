import eslintConfigExpoFlat from "eslint-config-expo/flat";
import { defineConfig } from "eslint/config";

import {
  baseConfiguration,
  JAVASCRIPT_FILES,
  RESTRICTED_SYNTAX,
  rulesConfiguration,
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

const WRAPPED_PRIMITIVES = [
  "KeyboardAvoidingView",
  "Pressable",
  "ScrollView",
  "Text",
  "TextInput",
];

const RELATIVE_IMPORT_PATTERN = {
  group: ["./*", "../*"],
  message: "Import through @/ instead of a relative path.",
};

const WRAPPED_PRIMITIVES_IMPORT = {
  importNames: WRAPPED_PRIMITIVES,
  message: "Use the component with the same name from @/components.",
  name: "react-native",
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
      "react/jsx-props-no-spreading": [
        "error",
        {
          exceptions: WRAPPED_PRIMITIVES.map(
            (primitive) => `ReactNative.${primitive}`,
          ),
        },
      ],
    },
  },
  {
    files: ["src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RELATIVE_IMPORT_PATTERN] },
      ],
    },
  },
]);
