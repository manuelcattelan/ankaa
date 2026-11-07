import * as Record from "effect/Record";
import { DynamicColorIOS } from "react-native";

import type { TokenSets } from "#/shared/core/merge-token-sets.ts";
import type { ColorReference } from "#/shared/core/resolve-colors.ts";
import type { OpacityPrimitiveName } from "#/shared/tokens/opacity.ts";

import { resolveColors } from "#/shared/core/resolve-colors.ts";
import { opacity } from "#/shared/tokens/opacity.ts";

// Placeholders until values are chosen. The steps that foreground, accent,
// border, background, separator and dangerFill point at hold the light and
// dark colors of today's navigation theme (expo-router's DefaultTheme and
// DarkTheme), so the app looks the same until then, and the other steps hold
// Tailwind's.
const COLOR_PRIMITIVES = {
  amber50: "#fffbeb",
  amber100: "#fef3c7",
  amber200: "#fde68a",
  amber300: "#fcd34d",
  amber400: "#fbbf24",
  amber500: "#f59e0b",
  amber600: "#d97706",
  amber700: "#b45309",
  amber800: "#92400e",
  amber900: "#78350f",
  amber950: "#451a03",
  black: "#000000",
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue300: "#93c5fd",
  blue400: "#0a84ff",
  blue500: "#007aff",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",
  blue950: "#172554",
  green50: "#f0fdf4",
  green100: "#dcfce7",
  green200: "#bbf7d0",
  green300: "#86efac",
  green400: "#4ade80",
  green500: "#22c55e",
  green600: "#16a34a",
  green700: "#15803d",
  green800: "#166534",
  green900: "#14532d",
  green950: "#052e16",
  neutral50: "#f2f2f2",
  neutral100: "#e5e5e7",
  neutral200: "#d8d8d8",
  neutral300: "#d4d4d4",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#272729",
  neutral900: "#1c1c1e",
  neutral950: "#010101",
  red50: "#fef2f2",
  red100: "#fee2e2",
  red200: "#fecaca",
  red300: "#fca5a5",
  red400: "#ff453a",
  red500: "#ff3b30",
  red600: "#dc2626",
  red700: "#b91c1c",
  red800: "#991b1b",
  red900: "#7f1d1d",
  red950: "#450a0a",
  white: "#ffffff",
};

type ColorSetReference = ColorReference<
  keyof typeof COLOR_PRIMITIVES,
  OpacityPrimitiveName
>;

const BASE_COLOR_SET = {
  accentBackground: "blue50",
  accentBorder: "blue500",
  accentFill: "blue500",
  accentFillForeground: "white",
  accentForeground: "blue500",
  background: "neutral50",
  border: "neutral200",
  dangerBackground: "red50",
  dangerBorder: "red600",
  dangerFill: "red500",
  dangerFillForeground: "white",
  dangerForeground: "red600",
  elevatedBackground: "neutral50",
  elevatedGroupedBackground: "neutral50",
  fill: { color: "neutral500", opacity: "percent20" },
  foreground: "neutral900",
  groupedBackground: "neutral50",
  infoBackground: "blue50",
  infoBorder: "blue600",
  infoFill: "blue500",
  infoFillForeground: "white",
  infoForeground: "blue600",
  overlay: { color: "black", opacity: "percent40" },
  placeholderForeground: "neutral400",
  pressedAccentFill: "blue600",
  pressedDangerFill: "red600",
  secondaryBackground: "white",
  secondaryElevatedBackground: "white",
  secondaryElevatedGroupedBackground: "white",
  secondaryFill: { color: "neutral500", opacity: "percent10" },
  secondaryForeground: "neutral600",
  secondaryGroupedBackground: "white",
  separator: "neutral200",
  shadow: { color: "black", opacity: "percent20" },
  successBackground: "green50",
  successBorder: "green700",
  successFill: "green600",
  successFillForeground: "white",
  successForeground: "green700",
  tertiaryBackground: "neutral50",
  tertiaryElevatedBackground: "neutral50",
  tertiaryElevatedGroupedBackground: "neutral50",
  tertiaryFill: { color: "neutral500", opacity: "percent5" },
  tertiaryForeground: "neutral500",
  tertiaryGroupedBackground: "neutral50",
  warningBackground: "amber50",
  warningBorder: "amber700",
  warningFill: "amber500",
  warningFillForeground: "black",
  warningForeground: "amber700",
} satisfies Record<string, ColorSetReference>;

type ColorSet = Record<keyof typeof BASE_COLOR_SET, ColorSetReference>;

const DARK_COLOR_SET = {
  accentBackground: "blue950",
  accentBorder: "blue400",
  accentFill: "blue400",
  accentForeground: "blue400",
  background: "neutral950",
  border: "neutral800",
  dangerBackground: "red950",
  dangerBorder: "red400",
  dangerFill: "red400",
  dangerForeground: "red400",
  elevatedBackground: "neutral900",
  elevatedGroupedBackground: "neutral900",
  fill: { color: "neutral400", opacity: "percent30" },
  foreground: "neutral100",
  groupedBackground: "neutral950",
  infoBackground: "blue950",
  infoBorder: "blue400",
  infoFill: "blue400",
  infoForeground: "blue400",
  overlay: { color: "black", opacity: "percent60" },
  placeholderForeground: "neutral600",
  pressedAccentFill: "blue300",
  pressedDangerFill: "red300",
  secondaryBackground: "neutral900",
  secondaryElevatedBackground: "neutral800",
  secondaryElevatedGroupedBackground: "neutral800",
  secondaryFill: { color: "neutral400", opacity: "percent20" },
  secondaryForeground: "neutral400",
  secondaryGroupedBackground: "neutral900",
  separator: "neutral800",
  shadow: { color: "black", opacity: "percent60" },
  successBackground: "green950",
  successBorder: "green400",
  successFill: "green500",
  successForeground: "green400",
  tertiaryBackground: "neutral800",
  tertiaryElevatedBackground: "neutral700",
  tertiaryElevatedGroupedBackground: "neutral700",
  tertiaryFill: { color: "neutral400", opacity: "percent10" },
  tertiaryForeground: "neutral500",
  tertiaryGroupedBackground: "neutral800",
  warningBackground: "amber950",
  warningBorder: "amber400",
  warningFill: "amber400",
  warningForeground: "amber400",
} satisfies Partial<ColorSet>;

// Placeholders: each high-contrast Context equals its base Context until
// values are chosen.
const COLOR_SETS = {
  base: BASE_COLOR_SET,
  modifiers: {
    appearance: {
      dark: DARK_COLOR_SET,
      darkHighContrast: DARK_COLOR_SET,
      light: {},
      lightHighContrast: {},
    },
  },
} satisfies TokenSets<ColorSet>;

const resolvedColors = resolveColors({
  opacityPrimitives: opacity,
  primitives: COLOR_PRIMITIVES,
  sets: COLOR_SETS,
});

/**
 * The color Token family: each Role is one `DynamicColorIOS`, which iOS
 * switches between light and dark appearance, with or without Increase
 * Contrast, with no re-render. The primitives stay in this file, because a
 * primitive never follows appearance. `variants` holds the plain colors of
 * every Role in each Color variant, for animated colors, which only
 * `useColorVariant()` reads, because Reanimated can't animate a
 * `DynamicColorIOS`.
 */
export const color = {
  ...Record.map(resolvedColors, (variants) => DynamicColorIOS(variants)),
  variants: {
    dark: Record.map(resolvedColors, (variants) => variants.dark),
    darkHighContrast: Record.map(
      resolvedColors,
      (variants) => variants.highContrastDark,
    ),
    light: Record.map(resolvedColors, (variants) => variants.light),
    lightHighContrast: Record.map(
      resolvedColors,
      (variants) => variants.highContrastLight,
    ),
  },
};
