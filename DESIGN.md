# Design

How the mobile app looks and feels: the rules of its design system and the terms they use. This file follows Ankaa's own structure, not Google's DESIGN.md format. No documented default; chosen for Ankaa because Google's format is alpha and built around values, nothing Ankaa uses reads it, its "Elevation & Depth" section and `rounded` key contradict `shadows` and `radius`, and front-matter values would be a second source of truth ([#217](https://github.com/manuelcattelan/ankaa/issues/217)).

The values live in `apps/mobile/src/shared/tokens/`, and none is chosen yet. These rules hold for the whole design system:

- Ankaa is iOS only.
- Styling uses only `StyleSheet`.
- There's no Liquid Glass and no blur anywhere ([#226](https://github.com/manuelcattelan/ankaa/issues/226)).

## Tiers and value placement

Every [Design token](#design-token) is a [Primitive token](#primitive-token) or a [Semantic token](#semantic-token), and there's no component tier. No documented default; chosen for Ankaa because with one maintainer and one implementation per component, a component's own `StyleSheet` does a component tier's job. Established systems use two to four tiers ([#219](https://github.com/manuelcattelan/ankaa/issues/219)): Spectrum keeps component tokens "intentionally limited", and M3's "should point to a system or reference token".

Place every value by these rules ([#220](https://github.com/manuelcattelan/ankaa/issues/220), [#229](https://github.com/manuelcattelan/ankaa/issues/229)):

1. Write a raw value only in a primitive token, and make every semantic token point at a primitive, so each value is defined once.
2. When a value falls between two steps of a scale, use the nearest step, because "The grid is the point" ([Expo](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-design-system/SKILL.md)). Motion is exempt: see Motion.
3. When an off-scale value is needed a second time, add it to its scale as a new step instead of repeating it, as the root `AGENTS.md` shares code from its second copy.
4. When similar components share a decision, such as the padding of controls, make it a pattern token: a semantic token named after the pattern, such as `spacing.controlPadding`, as Primer's `control-*` tokens do.
5. Keep a truly local value, such as an icon's optical nudge, as a module-level `CONSTANT_CASE` constant in the file that uses it, with a comment saying why it's off the scale.

Use a semantic token whenever one fits. Use a primitive token only when none fits, and only from a family with no contexts, such as `spacing.md`: a primitive never changes with a setting, so a color primitive would ignore Dark Mode and Increase Contrast. That's why the primitives of color, typography and iconography aren't exported.

[Contexts](#context) exist only at the semantic tier, never in token names, and a [Token family](#token-family) has a semantic tier only where it has Contexts or [Roles](#role): M3 themes at its system tier, Fluent's alias tokens hold light and dark, and DTCG stacks a set per Context over unchanging tokens. A dimension family can be its scale plus [Pattern tokens](#pattern-token).

A token's name is the family, then modifiers, then the head, and a state is a modifier, as in `color.secondaryForeground` and `color.pressedAccentFill`. No documented default; chosen for Ankaa because it's Apple's order (`secondaryLabel`) and the root `AGENTS.md`'s Composition rule, and the family object already does the grouping that web systems' general-to-specific order serves.

- The family part is the family's name, never a synonym, such as `spacing.md` and never `space.md`.
- Emphasis levels use the ordinal rank with the default unmarked: `color.foreground`, `color.secondaryForeground`, `color.tertiaryForeground`. This is Apple's, Carbon's and Polaris's vocabulary, and words such as `muted` don't show their order.
- A color primitive is a hue plus a lightness number, such as `blue500`, because every system researched numbers color steps by lightness.

## Resolution

The [Resolver](#resolver) follows DTCG's [Resolver Module 2025.10](https://www.designtokens.org/tr/2025.10/resolver/), a published standard and the maintainer's preference ([#221](https://github.com/manuelcattelan/ankaa/issues/221)). A family's Semantic tokens are a base set plus, for each [Modifier](#modifier), one set per Context that holds only the tokens the Context changes. The Resolver merges the base set and the selected Contexts in the [Resolution order](#resolution-order), a later set replacing a token an earlier one holds, and only then follows each Semantic token's reference (DTCG's alias) to its Primitive token.

- The Modifiers are appearance, Reduce Motion and Bold Text, and the Resolution order is base, appearance, Reduce Motion, Bold Text. Modifiers are orthogonal and meet only through references, so the order never decides a value: DTCG says "a modifier MUST NOT reference any other modifier".
- Appearance is one Modifier with four Contexts, `light`, `dark`, `lightHighContrast` and `darkHighContrast`. This is DTCG's own theme-by-contrast example, and it matches the HIG's "light and dark variants, and an increased contrast option for each variant" and the four keys `DynamicColorIOS` takes.
- Appearance resolves natively. The Resolver resolves all four Contexts at module load and packs each color Semantic token into one `DynamicColorIOS`, which iOS switches with no JS state or re-render. This is React Native's [documented mechanism](https://reactnative.dev/docs/dynamiccolorios), and React Native warns against approximating native colors in JS.
- Every family resolves to values React Native or Reanimated take directly, so no adapter sits between a token and a style. No documented default; chosen for Ankaa to keep adapters out. Color resolves to a `ColorValue`, typography to a style part and a `Text` props part, the dimension families and opacity to numbers, shadows to `boxShadow` object arrays, motion to Reanimated configs, and haptics to expo-haptics values.
- The Resolver throws when a Modifier of a family has no input, as DTCG requires of a Modifier with no default. The root glossary's [Core](GLOSSARY.md#core) never throws, because it returns an Outcome for every decision, but tokens resolve at module load: a missing input is a defect in the token files that must stop the app from starting, and no caller could act on an Outcome.

These settings aren't Modifiers:

- Grayscale, Color Filters and Classic Invert: iOS applies them to the whole screen. Color requires a cue beyond color, and media ignores invert (see Accessibility).
- VoiceOver: no value depends on it.
- Right-to-left: it changes only on reload, and `start`/`end` mirror natively.
- Prefer Cross-Fade: no documented default; chosen for Ankaa because Apple gives it no meaning beyond Reduce Motion, whose reduced Context already fades.
- Reduce Transparency: nothing translucent reacts to it, since Apple scopes it to "(mainly window) backgrounds". A material added later brings it back ([#226](https://github.com/manuelcattelan/ankaa/issues/226)).

## Tokens in code

The design system lives in `apps/mobile/src/shared/`, with no package and no barrel. No documented default; chosen for Ankaa under the root `AGENTS.md`'s Structure rules, and Expo's skill defers to a project's own system ([#227](https://github.com/manuelcattelan/ankaa/issues/227)).

- `tokens/` holds one file per family, named after it, such as `tokens/color.ts`, and no `…-primitives` file.
- `core/` holds the Resolver: `mergeTokenSets`, `resolveReferences`, `resolveColors`, `composeColor` and `computeConcentricRadius`. Lint lets only `tokens/` and the Resolver's tests import these module-load files. The growth lookup `getTextStyleGrowth`, `isAccessibilityCategory` and `getColorVariant` stay open to any file.
- `providers/` and `hooks/` hold the live state: `TokenProvider`, `useTokens` and `useColorVariant`.

Tokens are typed TypeScript objects that mirror DTCG's sets, Modifiers, Contexts, Resolution order and references, resolved at module load by Ankaa's pure Core Resolver, which throws on a missing input. A reference is typed as the name of a primitive, so a broken one fails to compile. No documented default; chosen for Ankaa because DTCG specifies only JSON, Terrazzo is async and unverified on Hermes, and Style Dictionary doesn't fully support 2025.10.

- Source objects are `CONSTANT_CASE` literals, such as `COLOR_PRIMITIVES` and `COLOR_SETS`, and each family is exported through the Resolver as a `lowerCamelCase` object named after it, such as `color.foreground` and `opacity.disabled`. The exports are created at runtime, under the root `AGENTS.md`'s Constants rule, so code reads like the token names.
- The primitives of color, typography and iconography stay unexported, so TypeScript blocks them. Other families export theirs, such as `opacity.percent40`.
- A Core function returns each color Semantic token's plain `{ light, dark, highContrastLight, highContrastDark }`, and the color token file calls `DynamicColorIOS` on it, because Core lint bans React Native imports ([#229](https://github.com/manuelcattelan/ankaa/issues/229)).
- Every Context is precomputed at module load, and live flags only select one. On a change, iOS switches colors itself, and the provider re-renders consumers. A running animation finishes with its config. No documented default; chosen for Ankaa because stable references come for free, which Reanimated's `exiting`/`layout` rely on, and React Compiler doesn't memoize module-level code.
- Static tokens go into a module-level `StyleSheet.create`, as in `styles.title = { color: color.accentForeground }`. Live tokens from `useTokens()` are appended to the style array after them, and both may share a file. A `fontScale` value becomes a small style object built in render, as `Button`'s title style is. No static style holds a hook value, which is what Expo's "never mix" rule targets.
- Any component, screens included, may import any token family, and each holds its styling inside its own perimeter: the maintainer doesn't want to force a flow of information.

The live flags are Bold Text, Reduce Motion and Increase Contrast, which iOS can change while the app runs:

- The `Accessibility` Service reads each one (`isBoldTextEnabled`, `isReduceMotionEnabled` and `isDarkerSystemColorsEnabled`, React Native's name for Increase Contrast), where a rejected read counts as off, and gives one change stream for each, built with `Stream.callback`, which removes its listener when the stream ends.
- `TokenProvider`, in the Composition root, forks a module-level program in its `useEffect` and interrupts it on cleanup. The program subscribes to the three change streams before its first reads, so no change between a read and its subscription is lost, and the provider shares the flags through a React context. React recommends context for theming, `TESTING.md` swaps behavior only through Layers, and the same pattern applies to the existing Service. Tests set the flags on the `Accessibility` Fake Layer.
- The color scheme and `fontScale` come from React Native's own hooks, `useColorScheme` and `useWindowDimensions`.
- `SplashScreenController` keeps the splash screen up until the first reads of the three flags settle, as well as the session, Expo's `preventAutoHideAsync` pattern, so the first frame has the right settings.
- There's no `ReducedMotionConfig` until a third-party component animating with `ReduceMotion.System` is adopted, because Reanimated reads Reduce Motion only once, at startup.

`useTokens()` gives each family with a live Modifier in the Context the live flags select, and re-renders its caller when a flag changes. Families with a live Modifier export their Contexts by name, such as `typography.boldTextOff` and `typography.boldTextOn`. `useTokens()` selects them everywhere except module level, where code names its Context, as in `SlideInDown.springify(motion.reduceMotionOff.enter.duration)`. Lint flags a named Context read inside any function but `useTokens`. The static families have flat exports. No documented default; chosen for Ankaa so `withSpring(x, motion.move)` can't silently ignore Reduce Motion.

A [Color variant](#color-variant) holds the plain colors of every color Role in one Context of appearance, because Reanimated can't animate a `DynamicColorIOS`, and never animating a color would rule out common interactions. The color token file exports the four as `color.variants[variant]`, and only `useColorVariant()` reads them, which returns the plain colors of the Color variant iOS shows now. It's built on the pure `getColorVariant()`, which combines `useColorScheme()` with live Increase Contrast into `light`, `dark`, `lightHighContrast` or `darkHighContrast`. Every color that isn't animated takes its `DynamicColorIOS` from `color`. No documented default; chosen for Ankaa: `contexts` would read like React context, and the maintainer rejected `plainValues`.

Ankaa follows Expo's [`expo-design-system`](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-design-system/SKILL.md) and `expo-native-ui` skills by reference, and departs from them here:

- Tokens live in `src/shared/tokens/`, with no barrel.
- The Resolver's exports are `lowerCamelCase`.
- Styles go into `StyleSheet.create`, not inline as `expo-native-ui` advises, and Ankaa writes none of its Android or web fallbacks.

## Color

Ankaa owns its whole palette, and no iOS system color appears in a token. No documented default; chosen for Ankaa because the maintainer wants Ankaa's own palette. Apple permits custom colors with four variants, as Fluent UI Apple does ([#220](https://github.com/manuelcattelan/ankaa/issues/220), [#222](https://github.com/manuelcattelan/ankaa/issues/222)).

Primitives:

- A primitive takes an absolute lightness number on Tailwind's 50–950 scale, with one neutral [Color ramp](#color-ramp) for both appearances. No documented default for the numbering; chosen for Ankaa because invariant primitives rule out contrast-relative numbering (Radix, Primer), and agents know Tailwind best. Tailwind, Carbon, M3 and Fluent share one neutral ramp.
- `white` and `black` are standalone primitives, and `transparent` exists nowhere: where nothing is painted, code sets no color, and React Native views paint nothing by default.
- Ramps exist only where a Role points: the neutral ramp, the [Accent](#accent)'s hue, and one hue each for danger, warning and success. `info` uses the Accent's ramp.
- A translucent color is a color primitive composed with an opacity primitive, with no alpha ramps, as in Primer, M3 and Fluent. Contrast is measured on the composite.

Roles:

- The [Foreground](#foreground) roles, shared by text and icons, are `color.foreground`, `color.secondaryForeground`, `color.tertiaryForeground` and `color.placeholderForeground`. Apple, Primer, Fluent and M3 share these roles, `text` would misname icons, and `label` collides with accessibility labels. Every level must meet 4.5:1, which leaves room for about three levels.
- [Backgrounds](#background) come in three standard levels (`color.background`, `color.secondaryBackground`, `color.tertiaryBackground`) and three grouped levels (`color.groupedBackground`, `color.secondaryGroupedBackground`, `color.tertiaryGroupedBackground`), as Apple's do, with depth from opaque lightness steps.
- Every Background level has an [Elevated background](#elevated-background), such as `color.elevatedBackground` or `color.secondaryElevatedGroupedBackground`, equal to its base in light appearance and brighter in dark, for full-height presented screens, `Modal` and `formSheet`. Apple elevates sheets and alerts, but `DynamicColorIOS` can't switch base to elevated, and Fluent UI Apple has an elevated slot for every color.
- `formSheet` is painted with Elevated backgrounds, not left to Liquid Glass. No documented default; chosen for Ankaa, against Apple's "remove any custom backgrounds", so the palette covers every surface.
- `color.separator` is for decorative dividers ([Separator](#separator)) with no contrast minimum, and `color.border` is for control boundaries ([Border](#border)) at 3:1, following WCAG 1.4.11 and Primer's ADR-010.
- Three translucent neutral [Fills](#fill) follow Apple's meanings: `color.fill` for thin shapes, `color.secondaryFill` for medium shapes, and `color.tertiaryFill` for input fields and gray buttons. Fills need no contrast minimum while each filled control carries text or an icon that meets the targets. No documented default; chosen for Ankaa because Apple's fills are faint by design.
- `color.overlay` dims content behind overlays ([Overlay](#overlay)), composed from `black` and an opacity, like Atlassian's `blanket` and M3's `scrim`.
- `color.shadow` is `black` with an opacity, with four variants so dark and high contrast can be stronger, and every [Shadow](#shadow) uses it ([#226](https://github.com/manuelcattelan/ankaa/issues/226)).
- The Accent is `accent`, and the [Status roles](#status-role) are `danger` (destructive or failed), `warning`, `success` and `info`. `tint` collides with `tintColor`, `primary` collides with the emphasis rank, and `danger` follows Fluent, Primer and Atlassian.
- Accent and every Status role have a [Role kit](#role-kit): `…Fill`, `…FillForeground`, `…Foreground`, `…Background`, `…Border`, and `pressed…Fill` on accent and danger only, such as `color.accentFill` and `color.pressedAccentFill`. No documented default; chosen for Ankaa because it covers Apple's `plain()`, `tinted()` and `filled()` buttons, and the border matches Primer, Atlassian and Polaris. A text-like button's title, such as `Button`'s, takes `color.accentForeground`.
- There's no link role, no vibrant token, and `pressed` is the only state in color. Ankaa has no inline links, vibrancy can't be expressed in this stack, and iPhone has no hover. Disabled is `opacity.disabled`, since WCAG exempts inactive components.

These contrast targets apply to composited colors:

| Variants      | Text and icons | Text at 18pt or bold | `border` and role borders |
| ------------- | -------------- | -------------------- | ------------------------- |
| Default       | 4.5:1          | 3:1                  | 3:1                       |
| High contrast | 7:1            | 7:1                  | 4.5:1                     |

The defaults follow the HIG and WCAG. The high-contrast targets follow M3 and Primer, since Apple gives no number. 7:1 in Dark Mode is an aim, not a gate.

Until values are chosen, the roles the migration uses (`color.foreground`, `color.accentForeground`, `color.border`, `color.background`, `color.separator` and `color.dangerFill`) take the light and dark colors of expo-router's `DefaultTheme` and `DarkTheme`, the navigation theme the app had before them, each high-contrast variant equals its base, and every other token holds an arbitrary placeholder, so the app looks the same until then.

## Typography

Semantic tokens:

- The typography Semantic tokens are Apple's 11 [Text styles](#text-style), named after their `dynamicTypeRamp` values: `typography.largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption1` and `caption2`. Each carries its own ramp and holds only its values at the default text size, and iOS grows it on that ramp's curve at every other size. The ramp has one value per style, so any other set of styles would borrow another style's curve, and the names follow the root `AGENTS.md`'s rule for library constructs.
- Every Text style has an [Emphasized text style](#emphasized-text-style), such as `emphasizedBody`, at Apple's emphasized weight, so no component overrides `fontWeight` by hand. Apple gives every style an emphasized weight. For Headline it's Semibold, its default weight, so `emphasizedHeadline` differs from `headline` only under Bold Text.
- A token resolves to `{ style, props }`: `style` holds `fontFamily`, `fontWeight`, `fontSize`, `lineHeight` and `letterSpacing` for `Text`'s style array, and `props` holds `dynamicTypeRamp`, which is a `Text` prop, not a style.
- A token holds `letterSpacing: number | null`, and `null` leaves the style key unset. No letter spacing is ever `0`, because `0` turns pair kerning off. Apple: "If this attribute is set to 0.0, no kerning is done at all".
- No Text style carries `maxFontSizeMultiplier`, because the HIG says "Make sure your app's layout adapts to all font sizes". A UI that can't grow, such as a custom bar, caps its text with `maxFontSizeMultiplier` as a [Pattern token](#pattern-token) and shows the Large Content Viewer instead (WWDC24 10074).

Bold Text:

- Bold Text is a [Modifier](#modifier), so typography exports its two [Contexts](#context) by name, `typography.boldTextOff` and `typography.boldTextOn`, each with every Text style and Emphasized text style. A component takes typography from `useTokens()`, which selects the Context from the live flag, and only module-level code names a Context (see Tokens in code).
- Each Text style, emphasized ones included, names its own Bold Text weight primitive: the next weight the font ships, at least one step up. No documented default; chosen for Ankaa because React Native never reads Bold Text in its font code, a custom font is coming, and Apple documents no mapping beyond Semibold for a Regular custom symbol.

Primitives:

- The primitives are the font family, named after the font, such as `systemFontFamily`; the font weights, with Apple's names, such as `semiboldFontWeight`; the font sizes and line heights in points, with t-shirt steps, such as `mdFontSize`; and the letter spacings `tighterLetterSpacing`, `tightLetterSpacing`, `looseLetterSpacing` and `looserLetterSpacing`, around an unnamed normal that is `null`. Primer and Polaris split primitives this way. For letter spacing there's no documented default; chosen for Ankaa because the names read in both directions.
- They stay unexported, so no component reaches a raw size or weight, and lint keeps `fontFamily`, `fontWeight`, `fontSize`, `lineHeight` and `letterSpacing` inside the typography file.

The font:

- The custom font is embedded with the expo-font config plugin's `ios.fonts` in `app.config.ts`, with every face in one family, its files in `apps/mobile/assets/fonts/`, and no `useFonts`. This is Expo SDK 58's recommendation, and iOS selects a face by `fontWeight`, as [Expo's font docs](https://docs.expo.dev/develop/user-interface/fonts/) say, departing from the `expo-design-system` skill's `fontFamily` per weight.
- Until the font is chosen, the plugin lists no file, the font family primitive is the system font, which React Native names `System`, and the other values are placeholders: Apple's sizes, line heights and weights at the default text size, and the next weight up under Bold Text, since the system font ships every weight.

Text size:

- Text size isn't a Modifier. `fontScale` is a number applied after resolution, outside DTCG's model, because DTCG's inputs are strings and `UIFontMetrics` can't be reached from React Native.
- `getTextStyleGrowth` in `core/` is the one growth lookup: Apple's per-style size table, keyed by the 12 `fontScale` values iOS reports, one per text size, returns how much a Text style grows over its default size. It exists because each Text style grows on its own curve: at AX5, `fontScale` is 3.571, while Body grows to 53 pt, 3.118 times its 17 pt, and Large Title to 60 pt, 1.765 times its 34 pt. Icons and scalable sizing scale by it (see Sizing). No documented default; chosen for Ankaa because it's the only way to match Apple's per-style curves from JS.
- `isAccessibilityCategory` in `core/` tells whether `fontScale` is an [Accessibility category](#accessibility-category), from AX1's 1.786 up, so the threshold lives in one place. No documented default; chosen for Ankaa because React Native has no content-size-category API ([#224](https://github.com/manuelcattelan/ankaa/issues/224)).
- `Text` doesn't take Text styles yet: the migration keeps its default text, and screens move to Text styles when they're refined.

## Iconography

## Spacing

- Spacing is one scale of [Scale steps](#scale-step) on a 4-point grid, from `spacing.xs` to `spacing.xxxl`, which may grow non-linearly at the large end and never scales with text size. This follows Expo's [`expo-design-system`](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-design-system/SKILL.md) skill, plus Carbon's and Atlassian's large steps: containers grow because their text does, and no system scales spacing.
- The two [Screen margins](#screen-margin), `spacing.horizontalScreenMargin` and `spacing.verticalScreenMargin`, are applied as `contentContainerStyle` padding on top of the insets iOS reserves, and safe-area insets are never tokens. The shared `ScrollView` applies both as its default `contentContainerStyle`, which a caller may override, and keeps `contentInsetAdjustmentBehavior="automatic"`. For the vertical margin there's no documented default; chosen for Ankaa because `automatic` insets alone let content touch the bars.
- Siblings use `gap`, and insets use `padding`, as Expo's `expo-design-system` and `expo-native-ui` skills prescribe.
- No setting changes a spacing, so spacing has no Contexts, and code may use a spacing primitive, such as `spacing.md`, when no [Pattern token](#pattern-token) fits.

## Sizing

- The [Hit target](#hit-target) is `sizing.minimumHitTarget`, at Apple's 44 pt. A control meets it through its own `minHeight` and `minWidth`, as `Button` and `TextInput` do, and takes `hitSlop` only when the layout can't fit it, because `hitSlop` stops at the parent's bounds. The HIG asks for "a hit region of at least 44x44 pt".
- A sizing token for something that holds text is applied as `minHeight`, never `height`, so the container grows with its text.
- A scalable sizing token pairs with one [Text style](#text-style) and scales by its growth, as icons do, with no cap: sizing exports its default size, and the component multiplies it by `getTextStyleGrowth` for the current `fontScale` in a small style object built in render. The Hit target and minimum sizes never scale. This follows Apple's `@ScaledMetric(relativeTo:)`.
- There's no layout-direction token and no stacking pattern. Every component works at every text size, as Apple requires, and a component that needs a switch reads whether the text size is an [Accessibility category](#accessibility-category), since Apple's components react in opposite directions on that flag.
- A third-party view that takes a fixed `height`, such as Apple's sign-in button, keeps a local constant until it's rebuilt.

## Borders

- Border widths are `borders.hairlineWidth`, bound to `StyleSheet.hairlineWidth`, plus t-shirt [Scale steps](#scale-step), with two Semantic tokens: `borders.separatorWidth` (the hairline), paired with `color.separator`, and `borders.width` (the default), paired with `color.border`, like Atlassian's `border.width`. Until values are chosen, `borders.width` is the hairline, the width of today's text field outline.
- There are no border style tokens, every border is solid, and widths take no Modifier: no system tokenizes style, dashed and dotted borders lose continuous corners, and Apple's Increase Contrast guidance covers only colors.

## Radius

- `radius.capsule` draws a [Capsule](#capsule). It's a large number that React Native clamps to half the view's shorter side, never a percentage, because `'50%'` draws an ellipse on a view that isn't square.
- A [Concentric radius](#concentric-radius) is a Semantic token computed at module load with `computeConcentricRadius`, as `max(parent radius − padding, fallback radius)`, its [Fallback radius](#fallback-radius) being the floor. This is Apple's formula ([WWDC25 356](https://developer.apple.com/videos/play/wwdc2025/356/)), which React Native has no API for.
- Every non-zero radius except `radius.capsule` pairs with `borderCurve: 'continuous'`, following Expo's `expo-native-ui` skill, so corners curve as Apple's do.
- A shape that floats near the screen's edge is a Capsule with extra margin, per WWDC25 356.
- No setting changes a radius, so radius has no Contexts, and code may use a radius primitive, such as `radius.md`.

## Shadows

The family is `shadows`, which DTCG's `shadow` type and Expo's `shadows` name so. "Elevation" appears in no token, and "elevated" belongs only to [Elevated backgrounds](#elevated-background): with Liquid Glass and blur out, the family holds only [Shadows](#shadow) ([#226](https://github.com/manuelcattelan/ankaa/issues/226)).

- One Role, `shadows.floating` ([Floating](#floating)), covers every surface that floats above content, such as a menu, a toast, an alert or a floating button. The custom [Chrome](#chrome) makes floating surfaces certain, and Ankaa has no resting surfaces.
- A Shadow is a `boxShadow` object array matching DTCG's Shadow type, never the string form or the legacy `shadow*` props, because only the object form carries a `DynamicColorIOS` that follows appearance. Lint flags a `shadowColor`, `shadowOffset`, `shadowOpacity` or `shadowRadius` key and a string `boxShadow` outside `tokens/`.
- A shadow primitive is a colorless geometry composite named by t-shirt size, such as `shadows.md`, created only where a Role points, and `shadows.floating` combines it with `color.shadow`. No documented default; chosen for Ankaa to keep rule 1 of Tiers and value placement, mirroring how Text styles split into primitives. A shadow built from a primitive where no Role fits takes `color.shadow` too, because every Shadow uses it.
- iOS draws a `boxShadow`'s blur at half the given `blurRadius` ([React Native](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/React/Fabric/Utils/RCTBoxShadow.mm#L67)).
- Under Increase Contrast only `color.shadow`'s variants change, never a Shadow's shape. No documented default; chosen for Ankaa to keep native switching with no re-render. A floating surface that proves hard to see gets a permanent `color.border` outline.

Ankaa draws its own Chrome from documented, official React Native and Expo components only, painted opaque: bars with `color.background` or `color.secondaryBackground`, and floating overlays with `color.elevatedBackground` and `shadows.floating`, with no Liquid Glass and no blur. This is the maintainer's choice of look: glass can't be opted out of from the iOS 27 SDK on, a blur can't take Ankaa's palette, asks for vibrancy this stack can't reach, and neither library checks Reduce Transparency ([#226](https://github.com/manuelcattelan/ankaa/issues/226)). The keyboard, the share sheet, permission prompts, Sign in with Apple and the status bar stay drawn by iOS. The Chrome is built in the component library effort, and follows Apple for its controls:

- "Always include a press state for a custom button" ([HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)), such as `opacity.pressed` on a plain control or a `pressed…Fill` on a filled one.
- A custom Back or Close button keeps the standard symbol and no text label that says Back or Close: "If you create a custom version of either, make sure it still looks the same, behaves as people expect, and matches the rest of your interface, and ensure you consistently implement it throughout your app or game" ([HIG Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)).

## Opacity

- The opacity Roles are `opacity.disabled` and `opacity.pressed`, applied to the whole control. Plain controls show pressed with `opacity.pressed`, and filled controls keep their `pressed…Fill`. For `pressed` there's no documented default; chosen for Ankaa because it mirrors Apple's "drawn lighter" and `TouchableOpacity`. Dimming isn't an opacity: it's `color.overlay`.
- No setting changes an opacity Role, so opacity has no Contexts, and code may use an opacity primitive when no Role fits. Apple and WCAG say nothing about these values.
- Opacity primitives are named by percent, such as `opacity.percent40`. No documented default; chosen for Ankaa following Atlassian and Tailwind, and `opacity[40]` would fail `no-magic-numbers`.

## Motion

## Haptics

## Accessibility

- Every Role carries a cue beyond color for each state and meaning, such as an icon or a label beside a Status role's color, because Grayscale and Color Filters change every color on the screen, and the HIG says "Avoid relying solely on color".
- Set `accessibilityIgnoresInvertColors` on every photo, video and app-icon image, because Smart Invert can't be read from React Native, and iOS would otherwise invert them.
- Check the contrast targets in Color on composited colors with throwaway checks when values are chosen, with no CI test, at the maintainer's choice.

## Glossary

The tokens, contexts and roles that style the mobile app. Terms in the [root glossary](GLOSSARY.md) also apply here.

### Color

#### Accent

The [Role](#role) of Ankaa's own color for what Users can interact with, such as a button's title, with a full [Role kit](#role-kit).

- **Avoid**: tint, brand, primary, link

#### Background

The opaque color behind a screen's content, at one of three levels, each layered on the one before: standard levels for plain screens such as sign-in, grouped levels for grouped lists such as a Routine's exercises.

- **Distinct from**: [Fill](#fill): a Fill colors a control or a small shape on top of a Background.

#### Border

The line around a control that shows where it ends, such as a text field's outline, which must contrast at least 3:1 with what surrounds it.

- **Distinct from**: [Separator](#separator): a Separator only divides content and needs no contrast.

#### Color ramp

The [Scale steps](#scale-step) of one hue, from the lightest at 50 to the darkest at 950, the same in light and dark appearance.

- **Distinct from**: the Dynamic Type ramp, which sets how a [Text style](#text-style) grows with the text size.

#### Elevated background

The counterpart of a [Background](#background) level for a surface presented over others, such as a sheet or a modal: equal to its base in light appearance and brighter in dark.

- **Avoid**: elevation
- **Distinct from**: [Shadow](#shadow): a Shadow shows that a surface floats; an Elevated background colors a presented surface.

#### Fill

The color of a control's shape, as opposed to its text or icon: one of three translucent neutral fills chosen by the shape's size, or the solid fill of a [Role](#role), such as a prominent button's.

#### Foreground

The color of text and icons, at three emphasis levels plus placeholder, or in a [Role](#role)'s color.

- **Avoid**: text color, label color

#### Overlay

The translucent color that dims the content behind something shown over it, such as the backdrop of an alert.

- **Avoid**: scrim, blanket, backdrop

#### Role kit

The six [Semantic tokens](#semantic-token) of [Accent](#accent) and of each [Status role](#status-role): its fill, the foreground on that fill, its foreground on ordinary backgrounds, its pale background, its border and, for Accent and danger only, its pressed fill.

#### Separator

The thin line that divides content, such as between list rows, which is decorative and needs no contrast minimum.

- **Avoid**: divider, hairline

#### Status role

A [Role](#role) that tells the state or outcome of something: danger (destructive or failed), warning, success or info, each with a full [Role kit](#role-kit) and never the only cue for its meaning.

- **Avoid**: feedback color, intent

### Layout and shape

#### Accessibility category

Any of the five largest text sizes Users can pick in iOS, from AX1 up, at which a component may change its layout, such as stacking items that sit side by side, to keep its text readable.

#### Capsule

A shape with fully round ends: its corner radius is half its shorter side.

- **Avoid**: pill, full radius

#### Concentric radius

The corner radius of a shape nested in another: its parent's radius minus the padding between them, never below its [Fallback radius](#fallback-radius), so the corners of both share a center.

#### Fallback radius

The smallest corner radius a [Concentric radius](#concentric-radius) may take, used when the parent's radius minus the padding would fall below it.

#### Hit target

The area of a control that responds to a touch, at least 44 by 44 points, which the control meets with its own size.

- **Avoid**: touch target, tap target, touch area

#### Screen margin

The space between a screen's content and the screen's edges, horizontal or vertical, added on top of the space iOS reserves for the status bar, the Home indicator and bars.

- **Avoid**: gutter, screen padding

### Shadows, motion and haptics

#### Chrome

The UI that frames and controls a screen's content instead of showing it: headers, tab bars, alerts, action sheets, menus and toasts. Ankaa draws its own, opaque, while the keyboard, the share sheet, permission prompts, Sign in with Apple and the status bar stay drawn by iOS.

- **Avoid**: navigation UI, system UI

#### Floating

The [Role](#role) of the [Shadow](#shadow) under every surface that floats above content, such as a menu, a toast, an alert or a floating button.

#### Haptic pattern

One of Apple's nine system haptic patterns (success, warning, error, selection and five impacts), each played only for its documented meaning and never as the only feedback.

- **Avoid**: vibration, haptic type

#### Reduced motion form

What a motion [Role](#role) does instead when Users turn on Reduce Motion: an entrance or exit fades, a move settles with no bounce, a scale or zoom jumps to its end, and a state change stays the same.

- **Avoid**: reduced animation, reduced context

#### Shadow

The soft dark shape drawn under a surface to show that it floats above the content behind it, in a color that adapts to appearance and Increase Contrast.

- **Avoid**: elevation, material, drop shadow
- **Distinct from**: [Elevated background](#elevated-background): an Elevated background colors a presented surface, and a Shadow shows that a surface floats.

### Tiers and resolution

#### Color variant

The colors of every color [Semantic token](#semantic-token) in one [Context](#context) of the appearance [Modifier](#modifier): light, dark, light with Increase Contrast or dark with Increase Contrast. Only animated colors read a Color variant, because an animation can't take a color that iOS switches on its own.

- **Avoid**: plain values, color context

#### Context

One value of a [Modifier](#modifier), such as dark appearance or Bold Text on, which selects the values the [Semantic tokens](#semantic-token) take while it holds.

- **Avoid**: mode, theme, token context

#### Design token

A named design decision, such as a color, a spacing or an animation's timing, that the mobile app's styles take instead of a raw value. Each one belongs to one [Token family](#token-family) and is either a [Primitive token](#primitive-token) or a [Semantic token](#semantic-token).

- **Avoid**: style variable, theme value

#### Modifier

An appearance or accessibility setting the [Resolver](#resolver) takes as input to pick a [Context](#context): appearance (light or dark, with or without Increase Contrast), Reduce Motion and Bold Text. Text size isn't a Modifier: the growth of values paired with a [Text style](#text-style) is applied after resolution.

- **Avoid**: resolver input, theme axis

#### Pattern token

A [Semantic token](#semantic-token) named after a decision that similar components share, such as the padding of controls.

- **Avoid**: pattern-named semantic token
- **Distinct from**: [Role](#role): a Role names what a token is for anywhere, such as foreground, and a Pattern token names what one kind of component shares.

#### Primitive token

A [Design token](#design-token) that holds a raw value, the same in every [Context](#context), such as a [Scale step](#scale-step).

- **Avoid**: global token, reference token, base token

#### Resolution order

The fixed order in which the [Resolver](#resolver) lays each [Modifier](#modifier)'s [Context](#context) over the base values: base, appearance, Reduce Motion, Bold Text. Modifiers are orthogonal, so the order never decides a value.

#### Resolver

The part of the mobile app's [Core](GLOSSARY.md#core) that turns the [Design tokens](#design-token) into the values styles take, for every [Context](#context), following the DTCG Resolver Module: it merges each Context over the base values in the [Resolution order](#resolution-order), then follows each [Semantic token](#semantic-token) to its [Primitive token](#primitive-token).

#### Role

The purpose a [Semantic token](#semantic-token) serves and is named after, such as foreground, danger, floating, disabled or enter: one concept across color, shadows, opacity and motion.

#### Scale step

A [Primitive token](#primitive-token) holding one value of an ordered scale, named by its place on it: a t-shirt size for a dimension, a lightness number for a color, a word for a duration or a damping, a percent for an opacity.

- **Avoid**: scale value

#### Semantic token

A [Design token](#design-token) named after its [Role](#role) or pattern instead of its value, which points at a [Primitive token](#primitive-token) in each [Context](#context), possibly a different one in each.

- **Avoid**: alias token, system token, functional token, component token

#### Token family

One of the eleven kinds of [Design token](#design-token): color, typography, iconography, spacing, sizing, borders, radius, shadows, opacity, motion and haptics. Every token's name starts with its family.

- **Avoid**: token category, token group

### Typography and iconography

#### Emphasized text style

The heavier counterpart of a [Text style](#text-style), at the same size, with its own heavier weight under Bold Text.

- **Avoid**: emphasized variant, bold style

#### Icon pairing

The tie between an icon and exactly one [Text style](#text-style), so the icon grows by that style's growth at every text size and its [Stroke](#stroke) matches that style's weight, under Bold Text too.

#### Stroke

The width of an icon's lines, measured in the icon's own grid so it grows with the icon, set to match the weight of its paired [Text style](#text-style) and heavier under Bold Text.

- **Avoid**: line weight, icon weight

#### Text style

One of Apple's eleven iOS text styles, from Large Title to Caption 2, that every text in the mobile app takes. It fixes the font, weight, size, line height and letter spacing at the default text size, and the curve iOS grows it by at every other size.

- **Avoid**: font style, type scale
