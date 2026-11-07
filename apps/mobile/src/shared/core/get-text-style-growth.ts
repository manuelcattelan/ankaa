import type { FontScale } from "#/shared/core/snap-font-scale.ts";

// Apple's point size of each Text style at each text size, from the HIG's
// iOS Dynamic Type sizes
// (https://developer.apple.com/design/human-interface-guidelines/typography#iOS-iPadOS-Dynamic-Type-sizes),
// keyed by the fontScale of that text size. Each style grows on its own curve,
// which no single multiplier matches: at AX5 fontScale is 3.571, while Body
// grows to 53 points, 3.118 times its 17, and Large Title to 60, 1.765 times
// its 34. UIFontMetrics, which iOS scales by, can't be reached from React
// Native.
const TEXT_STYLE_SIZES = {
  body: {
    0.823: 14,
    0.882: 15,
    0.941: 16,
    1: 17,
    1.118: 19,
    1.235: 21,
    1.353: 23,
    1.786: 28,
    2.143: 33,
    2.643: 40,
    3.143: 47,
    3.571: 53,
  },
  callout: {
    0.823: 13,
    0.882: 14,
    0.941: 15,
    1: 16,
    1.118: 18,
    1.235: 20,
    1.353: 22,
    1.786: 26,
    2.143: 32,
    2.643: 38,
    3.143: 44,
    3.571: 51,
  },
  caption1: {
    0.823: 11,
    0.882: 11,
    0.941: 11,
    1: 12,
    1.118: 14,
    1.235: 16,
    1.353: 18,
    1.786: 22,
    2.143: 26,
    2.643: 32,
    3.143: 37,
    3.571: 43,
  },
  caption2: {
    0.823: 11,
    0.882: 11,
    0.941: 11,
    1: 11,
    1.118: 13,
    1.235: 15,
    1.353: 17,
    1.786: 20,
    2.143: 24,
    2.643: 29,
    3.143: 34,
    3.571: 40,
  },
  footnote: {
    0.823: 12,
    0.882: 12,
    0.941: 12,
    1: 13,
    1.118: 15,
    1.235: 17,
    1.353: 19,
    1.786: 23,
    2.143: 27,
    2.643: 33,
    3.143: 38,
    3.571: 44,
  },
  headline: {
    0.823: 14,
    0.882: 15,
    0.941: 16,
    1: 17,
    1.118: 19,
    1.235: 21,
    1.353: 23,
    1.786: 28,
    2.143: 33,
    2.643: 40,
    3.143: 47,
    3.571: 53,
  },
  largeTitle: {
    0.823: 31,
    0.882: 32,
    0.941: 33,
    1: 34,
    1.118: 36,
    1.235: 38,
    1.353: 40,
    1.786: 44,
    2.143: 48,
    2.643: 52,
    3.143: 56,
    3.571: 60,
  },
  subheadline: {
    0.823: 12,
    0.882: 13,
    0.941: 14,
    1: 15,
    1.118: 17,
    1.235: 19,
    1.353: 21,
    1.786: 25,
    2.143: 30,
    2.643: 36,
    3.143: 42,
    3.571: 49,
  },
  title1: {
    0.823: 25,
    0.882: 26,
    0.941: 27,
    1: 28,
    1.118: 30,
    1.235: 32,
    1.353: 34,
    1.786: 38,
    2.143: 43,
    2.643: 48,
    3.143: 53,
    3.571: 58,
  },
  title2: {
    0.823: 19,
    0.882: 20,
    0.941: 21,
    1: 22,
    1.118: 24,
    1.235: 26,
    1.353: 28,
    1.786: 34,
    2.143: 39,
    2.643: 44,
    3.143: 50,
    3.571: 56,
  },
  title3: {
    0.823: 17,
    0.882: 18,
    0.941: 19,
    1: 20,
    1.118: 22,
    1.235: 24,
    1.353: 26,
    1.786: 31,
    2.143: 37,
    2.643: 43,
    3.143: 49,
    3.571: 55,
  },
} satisfies Record<string, Record<FontScale, number>>;

/** One of Apple's 11 Text styles, named after its `dynamicTypeRamp` value. */
export type TextStyleName = keyof typeof TEXT_STYLE_SIZES;

/**
 * Gives how much a Text style grows at the text size of `fontScale`: its size
 * there over its size at Large, Apple's per-style curve. Icons and scalable
 * sizing multiply their default size by it, so they grow with their paired
 * Text style instead of by the raw `fontScale`, which would grow a Large Title
 * icon about twice as much as its text. It takes only the 12 values iOS
 * reports.
 */
export function getTextStyleGrowth({
  fontScale,
  textStyle,
}: {
  fontScale: FontScale;
  textStyle: TextStyleName;
}) {
  const sizes = TEXT_STYLE_SIZES[textStyle];

  return sizes[fontScale] / sizes[1];
}
