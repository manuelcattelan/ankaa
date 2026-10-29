# Mobile

## Expo

Expo ships breaking changes in every SDK release, so an API you remember may have been renamed, moved or removed.

- Before you write code that uses an Expo, EAS or React Native API, read the major version of `expo` in `apps/mobile/package.json` and that version's docs at `https://docs.expo.dev/versions/v<major>.0.0/`. For a topic they don't cover, follow [`llms.txt`](https://docs.expo.dev/llms.txt) to the page you need, because it lists every page and corrects common AI misconceptions about Expo.
- Install a package with `pnpm --filter @ankaa/mobile exec expo install <package>`, never `pnpm add`, because `expo install` picks the version that works with the installed React Native.
- After you install or update a package with native code, change `app.config.ts` or upgrade the SDK, rebuild the development build with `pnpm --filter @ankaa/mobile exec expo prebuild --clean` and then `pnpm --filter @ankaa/mobile exec expo run:ios --no-bundler`, because the running build doesn't include native changes ([which libraries have native code](https://docs.expo.dev/workflow/using-libraries/)).
- Prefer an Expo module from the versioned docs over a third-party library, because Expo modules ship with each SDK, support the New Architecture and configure themselves through config plugins.
- To open a Universal Link in a development build, turn on Developer Mode and Associated Domains Development in the device's Settings › Developer, or iOS opens the link in Safari.

## Effect

- Run Effect programs only in query and mutation functions, in event handlers, mutation callbacks included, and in React effects. Define every program at module level and only run it from a component or hook, never compose one inline, so React Compiler never skips a component for holding a generator.
- In the Composition root, install `ConfigProvider.fromUnknown` with one static `process.env.EXPO_PUBLIC_*` reference per variable, never a dynamic read such as `process.env[name]`, because Expo inlines only static references ([Expo](https://docs.expo.dev/guides/environment-variables/)).

## Components

- Wrap a React Native primitive in `shared/components/` only once the app needs a default on it, and lint then bans importing it from `react-native`. Import a primitive that has no wrapper, such as `View`, directly.
- Make a wrapper extend its primitive's props and pass `...rest` on, so its API is the one React Native documents. Give every other shared component only the props it needs.
- In a component that passes `...rest` on, put the props a caller may override before `{...rest}`, the props the component owns after it, and the caller's `style` last in the style array, so a caller can change the defaults and the layout without breaking the component.

  🟢 `<Pressable role="button" {...rest} aria-busy={isPending} style={[styles.button, style]} />`.<br>
  🔴 `<Pressable role="button" aria-busy={isPending} style={[style, styles.button]} {...rest} />`.

- To let a component show UI it doesn't own, such as the UI of another Feature that only a route file may import, take it through `children` or a prop that takes JSX, and through a render prop only when the component has to pass the UI a value, as React does with [JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children).

  🟢 `<RoutineCard actions={<StartWorkoutButton routineId={routine.id} />} />`, and `renderExercisePicker(onSelectExercise)` when the picker needs the handler.<br>
  🔴 `renderActions={() => <StartWorkoutButton routineId={routine.id} />}`, a render prop that receives nothing.

- Give every component its own file in its Feature's `components/` or `screens/` folder, even when only one file uses it, so an agent reads and edits one component without loading a whole screen ([Thinking in React](https://react.dev/learn/thinking-in-react)). This is the one exception to the root's rule that code stays in the file that uses it, and helpers and private hooks still follow that rule.
- When code other than the returned JSX needs a value that an early return narrows, move that code into a child component that takes the narrowed value, because hooks can't come after an early return and lint bans `!` and `as`.
- Pass a form's or a screen's state and `dispatch` to its components through props. For a deep tree, follow React's order: props first, then `children` to cut out the components that only pass props on, then a reducer combined with a context ([Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [Scaling Up with a Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)). A context also holds state that several screens share.
- Screens never set colors: they don't read theme colors, and they pass `style` only to change the layout, so every color comes from `src/shared/components/`. A screen may call `useColorScheme` only to pick the variant of a third-party component, such as a sign-in button that comes in a light and a dark version.

## Forms and errors

- Check a form with one Effect Schema, built from the Filters and constants of `@ankaa/core`, whose `message` annotations read their text from the Feature's messages object. Decode a form's values with the shared Core function in `shared/core/`, which returns each field's message, or `null` for a valid field, and whether the form is valid, and never handle a Schema issue in a component, so the mapping from issues to fields lives and is tested once.
- In a nested form, let each component that shows fields decode its own part's value with its part's Schema, and let the form decide whether it can Save by decoding the whole Schema, which is built from those parts, so no path is passed down.
- Show a form's validation errors only after its first submit, then update them on every change.
- Map each Wire error of a procedure to the message Users see in one Core function per procedure, with an exhaustive `Match.valueTags`, and never write the mapping inline in a component, so a new Wire error fails to compile until it has a message.

## Messages

- Keep every text that Users see or hear in the messages object of the Feature that shows it, such as `ROUTINE_MESSAGES` in `features/routine/messages/routine-messages.ts`, or in the object in `shared/messages/` when several Features show it, so it can be reviewed, shared and translated. A Feature has exactly one messages object.
- Reuse a key only for the same message in the same role. Give every other use its own key, even when the text matches, because the two can change separately later.
- Write the labels of a value set as one entry of the messages object, typed `satisfies Record<Value, string>`, such as `sectionLabels: { … } satisfies Record<Section, string>`, so a new value in `@ankaa/core` fails to compile until it has a label. Move the entry to `shared/messages/` when a second Feature shows it.
- Address Users as "you", and never write "we", as [Apple recommends](https://developer.apple.com/design/human-interface-guidelines/writing): "Ankaa can't connect", not "We couldn't connect".
- Use the words that Users know, even when the code uses another name, such as "verification code" where the code says `otpCode`. Once a word is in a message, keep using it.
- Write an accessibility hint only when the label doesn't already make the result clear, because VoiceOver reads the hint after the label. Write it as a third-person verb with a final period, such as "Sends a new verification code to your email address."
- Never announce what a `StatusMessage` shows, because it announces itself. Announce any other message that must be heard when it appears, such as a field error after a failed submit on a screen with no `StatusMessage`, once, with `announceMessage` in the event handler or mutation callback that produces it. Never announce a `TextField` error, because it's already part of the field's accessible name, and announcing it would speak on every keystroke that changes it.
