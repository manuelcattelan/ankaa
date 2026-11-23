import type { TextProps, TextStyle } from "react-native";

import * as Record from "effect/Record";

import type { TextStyleName } from "#/shared/core/get-text-style-growth.ts";
import type { TokenSets } from "#/shared/core/merge-token-sets.ts";

import { mergeTokenSets } from "#/shared/core/merge-token-sets.ts";

// Placeholders until the font is chosen. The font family is the system font,
// which React Native names System, the weights are Apple's names on the 100 to
// 900 scale iOS maps them to, and the sizes and line heights are Apple's at
// the default text size
// (https://developer.apple.com/design/human-interface-guidelines/typography#iOS-iPadOS-Dynamic-Type-sizes).
// No letter spacing is 0, because 0 turns pair kerning off
// (https://developer.apple.com/documentation/foundation/nsattributedstring/key/kern).
const TYPOGRAPHY_PRIMITIVES = {
  boldFontWeight: "700",
  heavyFontWeight: "800",
  lgFontSize: 20,
  lgLineHeight: 25,
  looseLetterSpacing: 0.4,
  looserLetterSpacing: 0.8,
  mdFontSize: 17,
  mdLineHeight: 22,
  mediumFontWeight: "500",
  regularFontWeight: "400",
  semiboldFontWeight: "600",
  smFontSize: 16,
  smLineHeight: 21,
  systemFontFamily: "System",
  tighterLetterSpacing: -0.8,
  tightLetterSpacing: -0.4,
  xlFontSize: 22,
  xlLineHeight: 28,
  xsFontSize: 15,
  xsLineHeight: 20,
  xxlFontSize: 28,
  xxlLineHeight: 34,
  xxsFontSize: 13,
  xxsLineHeight: 18,
  xxxlFontSize: 34,
  xxxlLineHeight: 41,
  xxxsFontSize: 12,
  xxxsLineHeight: 16,
  xxxxsFontSize: 11,
  xxxxsLineHeight: 13,
} as const;

type TypographyPrimitiveName<Kind extends string> = Extract<
  keyof typeof TYPOGRAPHY_PRIMITIVES,
  `${string}${Kind}`
>;

type TypographyToken = {
  dynamicTypeRamp: NonNullable<TextProps["dynamicTypeRamp"]>;
  fontFamily: TypographyPrimitiveName<"FontFamily">;
  fontSize: TypographyPrimitiveName<"FontSize">;
  fontWeight: TypographyPrimitiveName<"FontWeight">;
  letterSpacing: null | TypographyPrimitiveName<"LetterSpacing">;
  lineHeight: TypographyPrimitiveName<"LineHeight">;
};

type TypographySet = Record<
  `emphasized${Capitalize<TextStyleName>}` | TextStyleName,
  TypographyToken
>;

// Each Text style takes Apple's weight, and each Emphasized text style
// Apple's emphasized weight, which for Headline is its own Semibold.
const BASE_TYPOGRAPHY_SET: TypographySet = {
  body: {
    dynamicTypeRamp: "body",
    fontFamily: "systemFontFamily",
    fontSize: "mdFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "mdLineHeight",
  },
  callout: {
    dynamicTypeRamp: "callout",
    fontFamily: "systemFontFamily",
    fontSize: "smFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "smLineHeight",
  },
  caption1: {
    dynamicTypeRamp: "caption1",
    fontFamily: "systemFontFamily",
    fontSize: "xxxsFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xxxsLineHeight",
  },
  caption2: {
    dynamicTypeRamp: "caption2",
    fontFamily: "systemFontFamily",
    fontSize: "xxxxsFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xxxxsLineHeight",
  },
  emphasizedBody: {
    dynamicTypeRamp: "body",
    fontFamily: "systemFontFamily",
    fontSize: "mdFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "mdLineHeight",
  },
  emphasizedCallout: {
    dynamicTypeRamp: "callout",
    fontFamily: "systemFontFamily",
    fontSize: "smFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "smLineHeight",
  },
  emphasizedCaption1: {
    dynamicTypeRamp: "caption1",
    fontFamily: "systemFontFamily",
    fontSize: "xxxsFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "xxxsLineHeight",
  },
  emphasizedCaption2: {
    dynamicTypeRamp: "caption2",
    fontFamily: "systemFontFamily",
    fontSize: "xxxxsFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "xxxxsLineHeight",
  },
  emphasizedFootnote: {
    dynamicTypeRamp: "footnote",
    fontFamily: "systemFontFamily",
    fontSize: "xxsFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "xxsLineHeight",
  },
  emphasizedHeadline: {
    dynamicTypeRamp: "headline",
    fontFamily: "systemFontFamily",
    fontSize: "mdFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "mdLineHeight",
  },
  emphasizedLargeTitle: {
    dynamicTypeRamp: "largeTitle",
    fontFamily: "systemFontFamily",
    fontSize: "xxxlFontSize",
    fontWeight: "boldFontWeight",
    letterSpacing: null,
    lineHeight: "xxxlLineHeight",
  },
  emphasizedSubheadline: {
    dynamicTypeRamp: "subheadline",
    fontFamily: "systemFontFamily",
    fontSize: "xsFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "xsLineHeight",
  },
  emphasizedTitle1: {
    dynamicTypeRamp: "title1",
    fontFamily: "systemFontFamily",
    fontSize: "xxlFontSize",
    fontWeight: "boldFontWeight",
    letterSpacing: null,
    lineHeight: "xxlLineHeight",
  },
  emphasizedTitle2: {
    dynamicTypeRamp: "title2",
    fontFamily: "systemFontFamily",
    fontSize: "xlFontSize",
    fontWeight: "boldFontWeight",
    letterSpacing: null,
    lineHeight: "xlLineHeight",
  },
  emphasizedTitle3: {
    dynamicTypeRamp: "title3",
    fontFamily: "systemFontFamily",
    fontSize: "lgFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "lgLineHeight",
  },
  footnote: {
    dynamicTypeRamp: "footnote",
    fontFamily: "systemFontFamily",
    fontSize: "xxsFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xxsLineHeight",
  },
  headline: {
    dynamicTypeRamp: "headline",
    fontFamily: "systemFontFamily",
    fontSize: "mdFontSize",
    fontWeight: "semiboldFontWeight",
    letterSpacing: null,
    lineHeight: "mdLineHeight",
  },
  largeTitle: {
    dynamicTypeRamp: "largeTitle",
    fontFamily: "systemFontFamily",
    fontSize: "xxxlFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xxxlLineHeight",
  },
  subheadline: {
    dynamicTypeRamp: "subheadline",
    fontFamily: "systemFontFamily",
    fontSize: "xsFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xsLineHeight",
  },
  title1: {
    dynamicTypeRamp: "title1",
    fontFamily: "systemFontFamily",
    fontSize: "xxlFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xxlLineHeight",
  },
  title2: {
    dynamicTypeRamp: "title2",
    fontFamily: "systemFontFamily",
    fontSize: "xlFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "xlLineHeight",
  },
  title3: {
    dynamicTypeRamp: "title3",
    fontFamily: "systemFontFamily",
    fontSize: "lgFontSize",
    fontWeight: "regularFontWeight",
    letterSpacing: null,
    lineHeight: "lgLineHeight",
  },
};

// React Native never reads Bold Text in its font code, so each Text style
// names its Bold Text weight: the next weight the font ships, at least one
// step up. The system font ships every weight.
const BOLD_TEXT_ON_TYPOGRAPHY_SET = {
  body: { ...BASE_TYPOGRAPHY_SET.body, fontWeight: "mediumFontWeight" },
  callout: { ...BASE_TYPOGRAPHY_SET.callout, fontWeight: "mediumFontWeight" },
  caption1: { ...BASE_TYPOGRAPHY_SET.caption1, fontWeight: "mediumFontWeight" },
  caption2: { ...BASE_TYPOGRAPHY_SET.caption2, fontWeight: "mediumFontWeight" },
  emphasizedBody: {
    ...BASE_TYPOGRAPHY_SET.emphasizedBody,
    fontWeight: "boldFontWeight",
  },
  emphasizedCallout: {
    ...BASE_TYPOGRAPHY_SET.emphasizedCallout,
    fontWeight: "boldFontWeight",
  },
  emphasizedCaption1: {
    ...BASE_TYPOGRAPHY_SET.emphasizedCaption1,
    fontWeight: "boldFontWeight",
  },
  emphasizedCaption2: {
    ...BASE_TYPOGRAPHY_SET.emphasizedCaption2,
    fontWeight: "boldFontWeight",
  },
  emphasizedFootnote: {
    ...BASE_TYPOGRAPHY_SET.emphasizedFootnote,
    fontWeight: "boldFontWeight",
  },
  emphasizedHeadline: {
    ...BASE_TYPOGRAPHY_SET.emphasizedHeadline,
    fontWeight: "boldFontWeight",
  },
  emphasizedLargeTitle: {
    ...BASE_TYPOGRAPHY_SET.emphasizedLargeTitle,
    fontWeight: "heavyFontWeight",
  },
  emphasizedSubheadline: {
    ...BASE_TYPOGRAPHY_SET.emphasizedSubheadline,
    fontWeight: "boldFontWeight",
  },
  emphasizedTitle1: {
    ...BASE_TYPOGRAPHY_SET.emphasizedTitle1,
    fontWeight: "heavyFontWeight",
  },
  emphasizedTitle2: {
    ...BASE_TYPOGRAPHY_SET.emphasizedTitle2,
    fontWeight: "heavyFontWeight",
  },
  emphasizedTitle3: {
    ...BASE_TYPOGRAPHY_SET.emphasizedTitle3,
    fontWeight: "boldFontWeight",
  },
  footnote: { ...BASE_TYPOGRAPHY_SET.footnote, fontWeight: "mediumFontWeight" },
  headline: { ...BASE_TYPOGRAPHY_SET.headline, fontWeight: "boldFontWeight" },
  largeTitle: {
    ...BASE_TYPOGRAPHY_SET.largeTitle,
    fontWeight: "mediumFontWeight",
  },
  subheadline: {
    ...BASE_TYPOGRAPHY_SET.subheadline,
    fontWeight: "mediumFontWeight",
  },
  title1: { ...BASE_TYPOGRAPHY_SET.title1, fontWeight: "mediumFontWeight" },
  title2: { ...BASE_TYPOGRAPHY_SET.title2, fontWeight: "mediumFontWeight" },
  title3: { ...BASE_TYPOGRAPHY_SET.title3, fontWeight: "mediumFontWeight" },
} satisfies TypographySet;

const TYPOGRAPHY_SETS = {
  base: BASE_TYPOGRAPHY_SET,
  modifiers: {
    boldText: { boldTextOff: {}, boldTextOn: BOLD_TEXT_ON_TYPOGRAPHY_SET },
  },
} satisfies TokenSets<TypographySet>;

// A token's letterSpacing of null leaves the style key unset, because 0 would
// turn pair kerning off.
function resolveTypographyToken(token: TypographyToken) {
  return {
    props: { dynamicTypeRamp: token.dynamicTypeRamp },
    style: {
      fontFamily: TYPOGRAPHY_PRIMITIVES[token.fontFamily],
      fontSize: TYPOGRAPHY_PRIMITIVES[token.fontSize],
      fontWeight: TYPOGRAPHY_PRIMITIVES[token.fontWeight],
      lineHeight: TYPOGRAPHY_PRIMITIVES[token.lineHeight],
      ...(token.letterSpacing === null
        ? {}
        : { letterSpacing: TYPOGRAPHY_PRIMITIVES[token.letterSpacing] }),
    } satisfies TextStyle,
  };
}

/**
 * The typography Token family: Apple's 11 Text styles and their Emphasized
 * text styles, each split into a `style` for `Text`'s style array and the
 * `props` that carry its `dynamicTypeRamp`, so iOS grows it on its own curve
 * at every text size. Bold Text is a live Modifier, so the family exports
 * each Context by name: `useTokens()` selects one from the live flag, and
 * module-level code names the one it needs. The primitives stay in this file.
 */
export const typography = {
  boldTextOff: Record.map(
    mergeTokenSets({
      inputs: { boldText: "boldTextOff" },
      sets: TYPOGRAPHY_SETS,
    }),
    resolveTypographyToken,
  ),
  boldTextOn: Record.map(
    mergeTokenSets({
      inputs: { boldText: "boldTextOn" },
      sets: TYPOGRAPHY_SETS,
    }),
    resolveTypographyToken,
  ),
};
