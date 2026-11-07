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
  getFeatureNames,
  JAVASCRIPT_FILES,
  RELATIVE_IMPORT_PATTERN,
  RESTRICTED_IMPORT_PATTERNS,
  RESTRICTED_MOCK_METHODS,
  RESTRICTED_SYNTAX,
  restrictedCallMatchers,
  rulesConfiguration,
  TEST_FILES,
  TEST_RESTRICTED_SYNTAX,
  TYPE_TEST_FILES,
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

const COLOR_KEY_PATTERN = "/^(?:c|.+C)olor$/";

const LEGACY_SHADOW_KEY_PATTERN = "/^shadow(?:Color|Offset|Opacity|Radius)$/";

const NATIVE_COLOR_API_PATTERN = "/^(?:DynamicColorIOS|PlatformColor)$/";

const HORIZONTAL_SIDE_KEY_PATTERN =
  "/^(?:left|right|(?:margin|padding)(?:Left|Right)|border(?:Left|Right)(?:Color|Width)|border(?:Top|Bottom)(?:Left|Right)Radius)$/";

const RADIUS_KEY_PATTERN = "/^border(?:[A-Z][a-z]*)*Radius$/";

const COLOR_VARIANTS_RESTRICTION = {
  message:
    "Take an animated color from useColorVariant() in #/shared/hooks/use-color-variant.ts, and every other color from color, so a plain color is read only where it follows appearance and Increase Contrast (DESIGN.md).",
  selector: [
    "MemberExpression[object.name='color']:matches([property.name='variants'], [property.value='variants'])",
    "VariableDeclarator[init.name='color'] > ObjectPattern > Property[key.name='variants']",
  ].join(", "),
};

const COLOR_VARIANT_HOOK_FILE = "src/shared/hooks/use-color-variant.ts";

const TYPOGRAPHY_KEY_PATTERN =
  "/^(?:fontFamily|fontSize|fontWeight|letterSpacing|lineHeight)$/";

const TYPOGRAPHY_KEY_RESTRICTION = {
  message:
    "Take this text style from a Text style of typography in #/shared/tokens/typography.ts, so every text grows with Dynamic Type and follows Bold Text (DESIGN.md).",
  selector: `Property[key.name=${TYPOGRAPHY_KEY_PATTERN}], Property[key.value=${TYPOGRAPHY_KEY_PATTERN}]`,
};

const LETTER_SPACING_KEY_PATTERN = "/^(?:letterSpacing|\\w+LetterSpacing)$/";

const ZERO_LETTER_SPACING_RESTRICTION = {
  message:
    "Use null instead of a letter spacing of 0, which leaves letterSpacing unset, because 0 turns pair kerning off (DESIGN.md).",
  selector: [
    `Property[key.name=${LETTER_SPACING_KEY_PATTERN}] > Literal.value[value=0]`,
    `Property[key.name=${LETTER_SPACING_KEY_PATTERN}] > UnaryExpression.value[argument.value=0]`,
  ].join(", "),
};

const LIVE_MODIFIER_FAMILY_PATTERN = "/^(?:iconography|motion|typography)$/";

const NAMED_CONTEXT_PATTERN = "/^(?:boldText|reduceMotion)O(?:ff|n)$/";

const NAMED_CONTEXT_RESTRICTION = {
  message:
    "Take this Token family from useTokens() in #/shared/hooks/use-tokens.ts, which selects its Context from the live flags. Name a Context only at module level (DESIGN.md).",
  selector: [
    `:function MemberExpression[object.name=${LIVE_MODIFIER_FAMILY_PATTERN}]:matches([property.name=${NAMED_CONTEXT_PATTERN}], [property.value=${NAMED_CONTEXT_PATTERN}])`,
    `:function VariableDeclarator[init.name=${LIVE_MODIFIER_FAMILY_PATTERN}] > ObjectPattern > Property[key.name=${NAMED_CONTEXT_PATTERN}]`,
  ].join(", "),
};

const TOKENS_HOOK_FILE = "src/shared/hooks/use-tokens.ts";

const TOKENS_HOOK_TEST_FILE = "src/shared/hooks/use-tokens.test.tsx";

const TYPOGRAPHY_FILE = "src/shared/tokens/typography.ts";

const GROWTH_LOOKUP_FILE = "src/shared/core/get-text-style-growth.ts";

const DESIGN_SYSTEM_RESTRICTED_SYNTAX = [
  COLOR_VARIANTS_RESTRICTION,
  NAMED_CONTEXT_RESTRICTION,
  TYPOGRAPHY_KEY_RESTRICTION,
  {
    message:
      "Take this color from color in #/shared/tokens/color.ts instead of a literal, so every color comes from the palette and follows appearance and Increase Contrast. Where nothing is painted, set no color (DESIGN.md).",
    selector: [
      `Property[key.name=${COLOR_KEY_PATTERN}] > :matches(Literal[raw=/^["']/], TemplateLiteral).value`,
      `Property[key.value=${COLOR_KEY_PATTERN}] > :matches(Literal[raw=/^["']/], TemplateLiteral).value`,
      `JSXAttribute[name.name=${COLOR_KEY_PATTERN}] > Literal`,
      `JSXAttribute[name.name=${COLOR_KEY_PATTERN}] > JSXExpressionContainer > :matches(Literal[raw=/^["']/], TemplateLiteral)`,
    ].join(", "),
  },
  {
    message:
      "Use DynamicColorIOS and PlatformColor only in #/shared/tokens/, so every native color is a color token that Ankaa's palette owns (DESIGN.md).",
    selector: `ImportSpecifier[imported.name=${NATIVE_COLOR_API_PATTERN}], MemberExpression[property.name=${NATIVE_COLOR_API_PATTERN}]`,
  },
  {
    message:
      "Use the start or end key instead of this left or right key, such as marginStart, so the layout mirrors natively in a right-to-left language (DESIGN.md).",
    selector: `Property[key.name=${HORIZONTAL_SIDE_KEY_PATTERN}], Property[key.value=${HORIZONTAL_SIDE_KEY_PATTERN}]`,
  },
  {
    message:
      "Take this radius from radius in #/shared/tokens/radius.ts instead of a percentage, because '50%' draws an ellipse on a view that isn't square, and radius.capsule draws a Capsule (DESIGN.md).",
    selector: `Property[key.name=${RADIUS_KEY_PATTERN}] > :matches(Literal[value=/%$/], TemplateLiteral).value`,
  },
  {
    message:
      "Leave borderStyle unset or 'solid', because every border is solid, and dashed and dotted borders lose continuous corners (DESIGN.md).",
    selector: "Property[key.name='borderStyle']:not([value.value='solid'])",
  },
  {
    message:
      "Set borderCurve: 'continuous' beside this radius, so its corners curve as Apple's do. Only radius.capsule goes without it (DESIGN.md).",
    selector: `ObjectExpression:not(:has(> Property[key.name='borderCurve'][value.value='continuous'])) > Property[key.name=${RADIUS_KEY_PATTERN}]:not([value.object.name='radius'][value.property.name='capsule'])`,
  },
  {
    message:
      "Take this shadow from shadows in #/shared/tokens/shadows.ts as a boxShadow, because the legacy shadow* props can't take a color that follows appearance and Increase Contrast (DESIGN.md).",
    selector: [
      `Property[key.name=${LEGACY_SHADOW_KEY_PATTERN}]`,
      `Property[key.value=${LEGACY_SHADOW_KEY_PATTERN}]`,
    ].join(", "),
  },
  {
    message:
      "Take this shadow from shadows in #/shared/tokens/shadows.ts instead of a string, because only boxShadow's object form takes a color that follows appearance and Increase Contrast (DESIGN.md).",
    selector: [
      "Property[key.name='boxShadow'] > :matches(Literal[raw=/^[\"']/], TemplateLiteral).value",
      "Property[key.value='boxShadow'] > :matches(Literal[raw=/^[\"']/], TemplateLiteral).value",
    ].join(", "),
  },
];

const TOKEN_FILES = ["src/shared/tokens/**"];

// The Resolver's Core files that resolve tokens at module load. The growth
// lookup, isAccessibilityCategory and getColorVariant stay open to any file.
const MODULE_LOAD_RESOLVER_FILE_NAMES = [
  "compose-color",
  "compute-concentric-radius",
  "merge-token-sets",
  "resolve-colors",
  "resolve-references",
];

const RESOLVED_FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];

const ROUTE_FILES = ["./src/app/!(_layout.tsx)", "./src/app/*/**"];

const ROUTE_IMPORTABLE_SHARED_PATHS = [
  "./shared/components",
  "./shared/screens",
];

const DYNAMIC_ROUTE_FILE_NAME_PATTERN = /^\[[a-z][A-Za-z]*\]\.tsx$/;

const WRAPPED_PRIMITIVES = ["ScrollView", "Text", "TextInput"];

const ROUTE_PACKAGE_IMPORT_PATTERN = {
  message:
    "Import only screens and components in a route file, and expo-router for its params and navigators. The Composition root wires the rest of the app.",
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

const PRESSABLE_IMPORT = {
  importNames: ["Pressable"],
  message:
    "Use Button from #/shared/components, so every pressable has the button role, the hit target, and the disabled and busy looks.",
  name: "react-native",
};

const MOBILE_RESTRICTED_IMPORT_PATHS = [
  MEMOIZATION_IMPORT,
  WRAPPED_PRIMITIVES_IMPORT,
  PRESSABLE_IMPORT,
];

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
    createFeatureIsolationZone(featureName),
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
      "Import only screens and components in a route file. The Composition root wires the rest of the app.",
    target: ROUTE_FILES,
  };

  const moduleLoadResolverZone = {
    from: MODULE_LOAD_RESOLVER_FILE_NAMES.map(
      (fileName) => `./src/shared/core/${fileName}.ts`,
    ),
    message:
      "Import the Resolver's module-load Core files only in #/shared/tokens/, and take the resolved tokens from there, so components never reach token values not meant for them (DESIGN.md).",
    target: [
      "./src/*",
      "./src/!(shared)/**",
      "./src/shared/*",
      "./src/shared/!(core|tokens)/**",
      `./src/shared/core/!(${[...MODULE_LOAD_RESOLVER_FILE_NAMES, "*.test"].join("|")}).ts`,
    ],
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
        // eslint-config-expo enables the core rule's TypeScript version,
        // which reports a type and a value of one name, a check that
        // TypeScript itself makes (https://typescript-eslint.io/rules/no-redeclare/).
        "@typescript-eslint/no-redeclare": "off",
        "import-x/no-restricted-paths": [
          "error",
          {
            basePath,
            zones: [
              ...featureIsolationZones,
              routeZone,
              moduleLoadResolverZone,
            ],
          },
        ],
        // eslint-config-expo enables import/namespace, which repeats a check
        // that TypeScript itself makes
        // (https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import),
        // and since SDK 58 compiles enums as `export var X = function (X) {…}({})`
        // it misses every enum of expo-notifications re-exported through
        // `export *`, such as `SchedulableTriggerInputTypes`.
        "import/namespace": "off",
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
    // The design system's value rules cover the app's code, and leave out
    // app.config.ts, whose splash color the native build reads.
    {
      files: ["src/**"],
      ignores: TOKEN_FILES,
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ...DESIGN_SYSTEM_RESTRICTED_SYNTAX,
        ],
      },
    },
    // useColorVariant is the one reader of the Color variants (DESIGN.md).
    {
      files: [COLOR_VARIANT_HOOK_FILE],
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ...DESIGN_SYSTEM_RESTRICTED_SYNTAX.filter(
            (restriction) => restriction !== COLOR_VARIANTS_RESTRICTION,
          ),
        ],
      },
    },
    // useTokens is the one reader of the named Contexts inside a function
    // (DESIGN.md).
    {
      files: [TOKENS_HOOK_FILE],
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ...DESIGN_SYSTEM_RESTRICTED_SYNTAX.filter(
            (restriction) => restriction !== NAMED_CONTEXT_RESTRICTION,
          ),
        ],
      },
    },
    // A token file holds the raw values that the value rules keep out of
    // every other file (DESIGN.md).
    {
      files: TOKEN_FILES,
      rules: { "@typescript-eslint/no-magic-numbers": "off" },
    },
    // Only the typography file holds text style keys, and it never sets a
    // letter spacing of 0 (DESIGN.md).
    {
      files: TOKEN_FILES,
      ignores: [TYPOGRAPHY_FILE],
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          TYPOGRAPHY_KEY_RESTRICTION,
        ],
      },
    },
    {
      files: [TYPOGRAPHY_FILE],
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ZERO_LETTER_SPACING_RESTRICTION,
        ],
      },
    },
    // The growth lookup holds Apple's table of Text style sizes, one number
    // per text size, which a name per number would only repeat.
    {
      files: [GROWTH_LOOKUP_FILE],
      rules: { "@typescript-eslint/no-magic-numbers": "off" },
    },
    createRestrictedImportsConfiguration({
      files: JAVASCRIPT_FILES,
      paths: MOBILE_RESTRICTED_IMPORT_PATHS,
      patterns: RESTRICTED_IMPORT_PATTERNS,
    }),
    // EAS evaluates app.config.ts through `expo config`, and through
    // @expo/config in its own process when that fails
    // (https://github.com/expo/eas-cli/blob/156e38eb54c9156202786c97fcb64c110430fe53/packages/build-tools/src/utils/appConfig.ts#L24-L36),
    // and the build log shows both ran under the build image's Node 22, not
    // the version in eas.json. Node accepts `imports` specifiers that start
    // with #/ only from v24.14.0 and v25.4.0
    // (https://nodejs.org/api/packages.html#imports,
    // https://github.com/nodejs/node/pull/60864), so app.config.ts imports
    // the app's files by relative path.
    createRestrictedImportsConfiguration({
      files: ["app.config.ts"],
      paths: MOBILE_RESTRICTED_IMPORT_PATHS,
      patterns: RESTRICTED_IMPORT_PATTERNS.filter(
        (pattern) => pattern !== RELATIVE_IMPORT_PATTERN,
      ),
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
      paths: MOBILE_RESTRICTED_IMPORT_PATHS,
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
          ...DESIGN_SYSTEM_RESTRICTED_SYNTAX,
          ...TEST_RESTRICTED_SYNTAX,
        ],
      },
    },
    // The Resolver's tests pass it raw values, as the token files do.
    {
      files: MODULE_LOAD_RESOLVER_FILE_NAMES.map(
        (fileName) => `src/shared/core/${fileName}.test.ts`,
      ),
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ...TEST_RESTRICTED_SYNTAX,
        ],
      },
    },
    // useTokens's test checks which named Context it returns.
    {
      files: [TOKENS_HOOK_TEST_FILE],
      rules: {
        "no-restricted-syntax": [
          "error",
          ...RESTRICTED_SYNTAX,
          ...MOBILE_RESTRICTED_SYNTAX,
          ...DESIGN_SYSTEM_RESTRICTED_SYNTAX.filter(
            (restriction) => restriction !== NAMED_CONTEXT_RESTRICTION,
          ),
          ...TEST_RESTRICTED_SYNTAX,
        ],
      },
    },
    {
      files: TYPE_TEST_FILES,
      // A type test asserts through @ts-expect-error, which check-types checks
      // (https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#-ts-expect-error-comments).
      rules: { "jest/expect-expect": "off" },
    },
  ]);
}
