# Mobile

## Expo

Expo ships breaking changes in every SDK release, so the APIs you remember may have been renamed, moved or removed. Before you write code that uses an Expo, EAS, or React Native API:

1. Read the major version of `expo` in `apps/mobile/package.json`.
2. Read the documentation for that version at https://docs.expo.dev/versions/v<major>.0.0/.
3. For a topic that this documentation doesn't cover, open https://docs.expo.dev/llms.txt and follow its link to the page you need. It lists every Expo documentation page and corrects common AI misconceptions about Expo.

Then follow these rules for common tasks:

- Install a package with `pnpm --filter @ankaa/mobile exec expo install <package>`, which picks the version known to work with the installed React Native version. `pnpm add` installs the latest version instead, which can break the build or crash the application.
- When you install or update a package with native code, change `app.config.ts` or upgrade the SDK, rebuild the development build, because the running build doesn't include those native changes: run `pnpm --filter @ankaa/mobile exec expo prebuild --clean`, then `pnpm --filter @ankaa/mobile exec expo run:ios --no-bundler`. To check whether a library contains native code, see https://docs.expo.dev/workflow/using-libraries/.
- Prefer an Expo module from the versioned documentation over a third-party library. Expo modules are released with each SDK, support the New Architecture and apply their native configuration through config plugins.

## Structure

The mobile app follows the architecture in the root `AGENTS.md`: its Core decides, and its Shell runs Effect programs through one Runtime, inside TanStack Query functions and event handlers.

- `src/app/` holds routes only: route components, layouts and other Expo Router special files, as described in https://docs.expo.dev/router/basics/notation/. Expo Router treats every file in this directory as a route, so put everything else in the folders below.
- A route file only reads its params and renders a screen or the components of a Feature. It may compose components of several Features, such as the Routine list and starting a Workout on the home route, because composing in the route keeps the Features isolated.
- The root layout, `src/app/_layout.tsx`, is the Composition root of the mobile app, and the one route file that wires the app, because Expo documents the root layout as the place for "initialization code" and "adding context providers":
  - It creates the Runtime from `applicationLayer`, the QueryClient and the persister once, each with a `useState` initializer, so nothing runs at import time.
  - It provides the Runtime through React context, read with `useRuntime()`, so every hook, screen and mutation default can receive a Runtime built from other Layers, such as in a test.
  - It registers the mutation defaults of each Feature.
  - It keeps the authentication guard, the `Stack.Protected` navigator, as Expo's authentication guide does.
  - Code that must run at startup, such as configuring Google sign-in, setting the notification handler or keeping the splash screen visible, runs in a Layer or in an effect of the root layout, never at import time.
- `src/layer.ts` defines `applicationLayer`, the application Layer of the mobile app. It installs `ConfigProvider.fromUnknown`, with one static `process.env.EXPO_PUBLIC_*` reference per variable, as the root `AGENTS.md` describes.
- `src/features/<feature>/` holds the code of one Feature, and `src/shared/` holds what several Features use. Both use the same role folders, so `shared/` reads exactly like a Feature, and each folder exists only when it holds a file:
  - `core/`: the Core of the Feature, such as reducers with their action unions, builders, selectors, the classification of errors to retry, validators and formatters.
  - `constants/`: the value sets and limits that only the mobile app uses, one file per concept, as the `constants/` folders of `@ankaa/core` hold them. A constant that the server uses too goes in `@ankaa/core` instead.
  - `services/`: the Services that wrap a device or platform API, such as the API client, the better-auth client, storage on the device, notifications, crypto and accessibility announcements.
  - `interactors/`: the Interactors, one business operation each.
  - `errors/`: the error classes of the Feature.
  - `queries/`: the Query options of the Feature, one factory function per file that takes the Runtime and returns `queryOptions(...)`, which hooks and screens import.
  - `mutations/`: the mutation options of the Feature, one factory function per file that takes the Runtime and returns `mutationOptions(...)` with a required `mutationKey`. The root layout registers the result of each factory as a mutation default, with `queryClient.setMutationDefaults(options.mutationKey, options)`, because TanStack Query's documentation says that persisted offline mutations "cannot be resumed when the page is reloaded unless you provide a default mutation function".
  - `hooks/`: the custom hooks.
  - `providers/`: the components that make React state available to the whole Feature through a context.
  - `screens/`: the screen components.
  - `components/`: the building blocks of the user interface. `shared/components/` holds the styled versions of React Native primitives, which screens use instead of the primitives themselves, and the components built from them that more than one Feature uses. Keep a component in one file together with the parts that exist only to be used inside it.
  - `messages/`: the text that users see or hear, grouped by concept, as [Messages](#messages) describes.

Route components, screens and layouts take their names this way:

- Name a route component after its file in `PascalCase`, followed by `Route`, such as `EditProfileRoute` for `edit-profile.tsx`. Leave out the `+` of a special file. When the file is `index.tsx`, use the name of its directory instead, without the parentheses of a group. `src/app/index.tsx` is `RootRoute`. "Route" is Expo Router's own word, and it keeps route components apart from screen components, while a bare name such as `Workout` would collide with the glossary concept and its type.
- Name a screen component after what it shows, followed by `Screen`, such as `WorkoutScreen`.
- Name a layout after its directory in `PascalCase`, followed by `Layout`, without the parentheses of a group. `src/app/_layout.tsx` is `RootLayout`.

## Components

Components and custom hooks all follow the same shape, so you always know where to find a value and what it is called.

- Order the body this way: hooks, state, queries and mutations, derived values, effects, early returns, handlers, returned JSX. State means `useState`, `useRef` and `useReducer`, and hooks means every other hook, such as `useRouter` or a custom hook. A statement may come later when it uses a value from a later step.
- Read the Runtime with `useRuntime()`, pass it to the factory of the Query options or mutation options, and pass the result to `useQuery` or `useMutation`, spreading it to add callbacks. This follows tRPC's TanStack Query integration, `useQuery(trpc.routine.list.queryOptions())`, with the Runtime in place of the tRPC proxy, and TanStack Query's `queryOptions` factories. The Runtime is only available through React context, so options built when their module loads can't reach it.
- Name a factory `create`, followed by its concept and `QueryOptions` or `MutationOptions`, such as `createRoutineListQueryOptions` or `createRoutineSaveMutationOptions`.
- Name a mutation after what the user does, as `<verb><Object>`, and the Interactor it runs after what that Interactor does, so two mutations can share one Interactor, as `sendOtpCode` and `resendOtpCode` both run `requestOtpCode`. Name a query after the data it returns. Name a handler `handle` followed by the mutation it triggers, or by its event when it triggers none. The example below shows each of them.
- Name a component after what it shows, starting with its concept, such as `StatusMessage`, and a custom hook `use` followed by what it keeps track of, such as `useCooldown`, because both read as things, not actions: a hook that loads the profile is `useUserProfile`, not `useFetchUserProfile`.
- In a screen, when code other than the returned JSX needs a value that an early return narrows, move that code into `<Name>Content` and pass it the narrowed value, as `EditProfileScreen` would with `EditProfileContent`. Hooks can't come after an early return and handlers lose the narrowing, while typing the value as required or adding `?? ""` would hide a missing value.
- Screens never set colors: they don't read theme colors, and they pass `style` only to change the layout, so every color comes from `src/shared/components/`. A screen may call `useColorScheme` only to pick the variant of a third-party component, such as a sign-in button that comes in a light and a dark version.
- Use the `role` and `aria-*` props, because they are the web standard and each state is its own prop, so a caller's `...rest` can't overwrite them all at once as it would an `accessibilityState` object. Use an `accessibility*` prop only when it has no `aria-*` alias, such as `accessibilityHint`.
- In a component that passes `...rest` on, put the props a caller may override before `{...rest}`, the props the component owns after it, and the caller's `style` last in the style array, so callers can change the defaults and the layout without breaking the component.
- When the same JSX structure appears a second time, turn it into one component, in the file that uses it, in the `components/` folder of its Feature when another file of the Feature uses it too, or in `src/shared/components/` when another Feature uses it too, so a change to the layout lands in one place.

🟢 Do this:

```tsx
type ProfileFormProperties = {
  onSave: () => void;
};

export function ProfileForm({ onSave }: ProfileFormProperties) {
  const runtime = useRuntime();

  const [email, setEmail] = useState("");

  const userProfile = useQuery(createUserProfileQueryOptions(runtime));

  const updateProfile = useMutation({
    ...createProfileSaveMutationOptions(runtime),
    onSuccess: onSave,
  });

  const isEmailChanged = email !== userProfile.data?.email;

  function handleChangeEmail(text: string) {
    setEmail(text);
    updateProfile.reset();
  }

  function handleUpdateProfile() {
    updateProfile.mutate({ email });
  }

  return (
    <>
      <TextField
        label={profileFormMessages.emailLabel}
        onChangeText={handleChangeEmail}
        value={email}
      />
      <Button
        disabled={!isEmailChanged}
        onPress={handleUpdateProfile}
        title={profileFormMessages.updateProfileButton}
      />
    </>
  );
}
```

🔴 Don't do this:

```tsx
type Props = {
  save: () => void;
};

export function ProfileForm({ save }: Props) {
  const runtime = useRuntime();

  const [email, setEmail] = useState("");

  const query = useQuery(createUserProfileQueryOptions(runtime));

  const mutation = useMutation({
    ...createProfileSaveMutationOptions(runtime),
    onSuccess: save,
  });

  const changed = email !== query.data?.email;

  function onEmailChange(text: string) {
    setEmail(text);
    mutation.reset();
  }

  function submit() {
    mutation.mutate({ email });
  }

  return (
    <>
      <TextField
        label={profileFormMessages.emailLabel}
        onChangeText={onEmailChange}
        value={email}
      />
      <Button
        disabled={!changed}
        onPress={submit}
        title={profileFormMessages.updateProfileButton}
      />
    </>
  );
}
```

## Messages

All the text that users see or hear lives in the `messages/` folders, never in other files, so it can be reviewed, translated later, and shared by every file that shows the same message. When you add or change a message, follow these rules:

- Group messages by concept, one file per concept, in the `messages/` folder of the Feature that shows them, or in `src/shared/messages/` when more than one Feature shows them. A concept is the screen or component that shows the messages, or something that more than one file shows, such as errors or rest notifications. Put an error in a group of errors only when more than one file shows it.
- Export one object from each messages file, named after its concept followed by `Messages`, such as `profileFormMessages` in `profile-form-messages.ts`, and read a message as `profileFormMessages.emailLabel`.
- End each key with the role of its message, such as `signOutButton` or `emailLabel`, so a key used in the wrong role stands out. Name a key for an error after its subject and then its state, such as `otpCodeExpired`.
- Reuse a key only for the same message in the same role, such as an error in a group of errors. Otherwise, give each use its own key even when the text matches, because the two can change separately later. This is why `@ankaa/no-duplicate-string` is off for messages.
- Address users as "you", and never write "we", as Apple recommends at https://developer.apple.com/design/human-interface-guidelines/writing: "The server can't be reached", not "We couldn't reach our server".
- Use the words that users know, even when the code uses a different name: users see "verification code" where the code says `otpCode`. Once a word is in a message, keep using it, such as "resend" for sending a verification code again.
- Write an accessibility hint only when the label doesn't already make the result clear, because VoiceOver reads the hint after the label, so repeating the label only slows users down. Write it as a third-person verb with a final period, such as "Sends a new verification code to your email address."
