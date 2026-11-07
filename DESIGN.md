# Design

How the mobile app looks and feels: the rules of its design system and the terms they use. This file follows Ankaa's own structure, not Google's DESIGN.md format. No documented default; chosen for Ankaa because Google's format is alpha and built around values, nothing Ankaa uses reads it, its "Elevation & Depth" section and `rounded` key contradict `shadows` and `radius`, and front-matter values would be a second source of truth ([#217](https://github.com/manuelcattelan/ankaa/issues/217)).

The values live in `apps/mobile/src/shared/tokens/`, and none is chosen yet. These rules hold for the whole design system:

- Ankaa is iOS only.
- Styling uses only `StyleSheet`.
- There's no Liquid Glass and no blur anywhere ([#226](https://github.com/manuelcattelan/ankaa/issues/226)).

## Tiers and value placement

## Resolution

## Tokens in code

## Color

## Typography

## Iconography

## Spacing

## Sizing

## Borders

## Radius

## Shadows

## Opacity

## Motion

## Haptics

## Accessibility

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
