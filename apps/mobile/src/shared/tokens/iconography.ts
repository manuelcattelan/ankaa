import * as Record from "effect/Record";

import type { TextStyleName } from "#/shared/core/get-text-style-growth.ts";
import type { TokenSets } from "#/shared/core/merge-token-sets.ts";

import { mergeTokenSets } from "#/shared/core/merge-token-sets.ts";

// Placeholders until values are chosen. The sizes are in points, at the
// default text size, and are the paired Text styles' font sizes. The Strokes
// are in units of the icon's own grid, so a Stroke grows with its icon, and
// stay at or below the 1.5 that Nucleo's 18-unit UI icons draw at most
// (https://nucleoapp.com), so the heaviest weight still fits. Each Stroke is
// named after the font weight it matches, as SF Symbols' weights are.
const ICONOGRAPHY_PRIMITIVES = {
  boldStroke: 1.375,
  heavyStroke: 1.5,
  lgSize: 20,
  mdSize: 17,
  mediumStroke: 1.125,
  regularStroke: 1,
  semiboldStroke: 1.25,
  smSize: 16,
  xlSize: 22,
  xsSize: 15,
  xxlSize: 28,
  xxsSize: 13,
  xxxlSize: 34,
  xxxsSize: 12,
  xxxxsSize: 11,
} as const;

type IconographyPrimitiveName<Kind extends string> = Extract<
  keyof typeof ICONOGRAPHY_PRIMITIVES,
  `${string}${Kind}`
>;

type IconographyToken = {
  size: IconographyPrimitiveName<"Size">;
  stroke: IconographyPrimitiveName<"Stroke">;
  textStyle: TextStyleName;
};

type IconographySet = Record<
  `emphasized${Capitalize<TextStyleName>}` | TextStyleName,
  IconographyToken
>;

// Each token pairs with the Text style it's named after, and its Stroke
// matches that style's weight, as typography's base set gives it.
const BASE_ICONOGRAPHY_SET: IconographySet = {
  body: { size: "mdSize", stroke: "regularStroke", textStyle: "body" },
  callout: { size: "smSize", stroke: "regularStroke", textStyle: "callout" },
  caption1: {
    size: "xxxsSize",
    stroke: "regularStroke",
    textStyle: "caption1",
  },
  caption2: {
    size: "xxxxsSize",
    stroke: "regularStroke",
    textStyle: "caption2",
  },
  emphasizedBody: {
    size: "mdSize",
    stroke: "semiboldStroke",
    textStyle: "body",
  },
  emphasizedCallout: {
    size: "smSize",
    stroke: "semiboldStroke",
    textStyle: "callout",
  },
  emphasizedCaption1: {
    size: "xxxsSize",
    stroke: "semiboldStroke",
    textStyle: "caption1",
  },
  emphasizedCaption2: {
    size: "xxxxsSize",
    stroke: "semiboldStroke",
    textStyle: "caption2",
  },
  emphasizedFootnote: {
    size: "xxsSize",
    stroke: "semiboldStroke",
    textStyle: "footnote",
  },
  emphasizedHeadline: {
    size: "mdSize",
    stroke: "semiboldStroke",
    textStyle: "headline",
  },
  emphasizedLargeTitle: {
    size: "xxxlSize",
    stroke: "boldStroke",
    textStyle: "largeTitle",
  },
  emphasizedSubheadline: {
    size: "xsSize",
    stroke: "semiboldStroke",
    textStyle: "subheadline",
  },
  emphasizedTitle1: {
    size: "xxlSize",
    stroke: "boldStroke",
    textStyle: "title1",
  },
  emphasizedTitle2: {
    size: "xlSize",
    stroke: "boldStroke",
    textStyle: "title2",
  },
  emphasizedTitle3: {
    size: "lgSize",
    stroke: "semiboldStroke",
    textStyle: "title3",
  },
  footnote: { size: "xxsSize", stroke: "regularStroke", textStyle: "footnote" },
  headline: {
    size: "mdSize",
    stroke: "semiboldStroke",
    textStyle: "headline",
  },
  largeTitle: {
    size: "xxxlSize",
    stroke: "regularStroke",
    textStyle: "largeTitle",
  },
  subheadline: {
    size: "xsSize",
    stroke: "regularStroke",
    textStyle: "subheadline",
  },
  title1: { size: "xxlSize", stroke: "regularStroke", textStyle: "title1" },
  title2: { size: "xlSize", stroke: "regularStroke", textStyle: "title2" },
  title3: { size: "lgSize", stroke: "regularStroke", textStyle: "title3" },
};

// Under Bold Text each Stroke matches its Text style's Bold Text weight, as
// typography's Bold Text on set gives it.
const BOLD_TEXT_ON_ICONOGRAPHY_SET = {
  body: { ...BASE_ICONOGRAPHY_SET.body, stroke: "mediumStroke" },
  callout: { ...BASE_ICONOGRAPHY_SET.callout, stroke: "mediumStroke" },
  caption1: { ...BASE_ICONOGRAPHY_SET.caption1, stroke: "mediumStroke" },
  caption2: { ...BASE_ICONOGRAPHY_SET.caption2, stroke: "mediumStroke" },
  emphasizedBody: {
    ...BASE_ICONOGRAPHY_SET.emphasizedBody,
    stroke: "boldStroke",
  },
  emphasizedCallout: {
    ...BASE_ICONOGRAPHY_SET.emphasizedCallout,
    stroke: "boldStroke",
  },
  emphasizedCaption1: {
    ...BASE_ICONOGRAPHY_SET.emphasizedCaption1,
    stroke: "boldStroke",
  },
  emphasizedCaption2: {
    ...BASE_ICONOGRAPHY_SET.emphasizedCaption2,
    stroke: "boldStroke",
  },
  emphasizedFootnote: {
    ...BASE_ICONOGRAPHY_SET.emphasizedFootnote,
    stroke: "boldStroke",
  },
  emphasizedHeadline: {
    ...BASE_ICONOGRAPHY_SET.emphasizedHeadline,
    stroke: "boldStroke",
  },
  emphasizedLargeTitle: {
    ...BASE_ICONOGRAPHY_SET.emphasizedLargeTitle,
    stroke: "heavyStroke",
  },
  emphasizedSubheadline: {
    ...BASE_ICONOGRAPHY_SET.emphasizedSubheadline,
    stroke: "boldStroke",
  },
  emphasizedTitle1: {
    ...BASE_ICONOGRAPHY_SET.emphasizedTitle1,
    stroke: "heavyStroke",
  },
  emphasizedTitle2: {
    ...BASE_ICONOGRAPHY_SET.emphasizedTitle2,
    stroke: "heavyStroke",
  },
  emphasizedTitle3: {
    ...BASE_ICONOGRAPHY_SET.emphasizedTitle3,
    stroke: "boldStroke",
  },
  footnote: { ...BASE_ICONOGRAPHY_SET.footnote, stroke: "mediumStroke" },
  headline: { ...BASE_ICONOGRAPHY_SET.headline, stroke: "boldStroke" },
  largeTitle: { ...BASE_ICONOGRAPHY_SET.largeTitle, stroke: "mediumStroke" },
  subheadline: { ...BASE_ICONOGRAPHY_SET.subheadline, stroke: "mediumStroke" },
  title1: { ...BASE_ICONOGRAPHY_SET.title1, stroke: "mediumStroke" },
  title2: { ...BASE_ICONOGRAPHY_SET.title2, stroke: "mediumStroke" },
  title3: { ...BASE_ICONOGRAPHY_SET.title3, stroke: "mediumStroke" },
} satisfies IconographySet;

const ICONOGRAPHY_SETS = {
  base: BASE_ICONOGRAPHY_SET,
  modifiers: {
    boldText: { boldTextOff: {}, boldTextOn: BOLD_TEXT_ON_ICONOGRAPHY_SET },
  },
} satisfies TokenSets<IconographySet>;

function resolveIconographyToken(token: IconographyToken) {
  return {
    size: ICONOGRAPHY_PRIMITIVES[token.size],
    stroke: ICONOGRAPHY_PRIMITIVES[token.stroke],
    textStyle: token.textStyle,
  };
}

/** The name of an iconography token, which is the name of its Text style. */
export type IconographyTokenName = keyof IconographySet;

/**
 * The iconography Token family: one token per Text style and Emphasized text
 * style, named after it, each holding the icon's size at the default text
 * size, its Stroke, and the Text style it grows with. Bold Text is a live
 * Modifier, so the family exports each Context by name: `useTokens()`
 * selects one from the live flag, and module-level code names the one it
 * needs. Its color comes from the Foreground roles of color. The primitives
 * stay in this file.
 */
export const iconography = {
  boldTextOff: Record.map(
    mergeTokenSets({
      inputs: { boldText: "boldTextOff" },
      sets: ICONOGRAPHY_SETS,
    }),
    resolveIconographyToken,
  ),
  boldTextOn: Record.map(
    mergeTokenSets({
      inputs: { boldText: "boldTextOn" },
      sets: ICONOGRAPHY_SETS,
    }),
    resolveIconographyToken,
  ),
};
