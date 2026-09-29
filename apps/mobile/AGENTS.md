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

- `src/app/` holds routes only: screens, layouts and other Expo Router special files, as described in https://docs.expo.dev/router/basics/notation/. Expo Router treats every file in this directory as a route, so put everything else in the directories below.
- `src/components/` holds the building blocks of the user interface: styled versions of React Native primitives, which screens use instead of the primitives themselves, and the components built from them that more than one file uses. Keep a component in one file together with the parts that exist only to be used inside it.
- `src/providers/` holds the components that make a React context available to the whole application, one per file. The root layout then imports and renders them.
- `src/clients/` holds the library clients and contexts that are created once when their module loads. A client that a provider creates with `useState` stays in that provider's file.
- `src/utilities/` holds the functions and constants that more than one file uses, one file per concept. `constants.ts` holds the shared constants that belong to no single concept, and `messages.ts` holds every string that users see or hear.

Screens and layouts take their names from the path of their file:

- Name a screen after its file in `PascalCase`, followed by `Screen`, such as `EditProfileScreen` for `edit-profile.tsx`. Leave out the `+` of a special file. When the file is `index.tsx`, use the name of its directory instead, without the parentheses of a group. `src/app/index.tsx` is `RootScreen`.
- Name a layout after its directory in `PascalCase`, followed by `Layout`, without the parentheses of a group. `src/app/_layout.tsx` is `RootLayout`.

## Components

Components and custom hooks all follow the same shape, so you always know where to find a value and what it is called.

- Order the body this way: hooks, state, queries and mutations, derived values, effects, early returns, handlers, returned JSX. State means `useState`, `useRef` and `useReducer`, and hooks means every other hook, such as `useRouter` or a custom hook. A statement may come later when it uses a value from a later step.
- Name a mutation `<verb><Object>` and a query after the data it returns. Name a handler `handle` followed by the mutation it triggers, or by its event when it triggers none. The example below shows each of them.
- In a screen, when code other than the returned JSX needs a value that an early return narrows, move that code into `<Name>Content` and pass it the narrowed value, as `EditProfileScreen` would with `EditProfileContent`. Hooks can't come after an early return and handlers lose the narrowing, while typing the value as required or adding `?? ""` would hide a missing value.
- Screens never set colors: they don't read theme colors, and they pass `style` only to change the layout, so every color comes from `src/components/`. A screen may call `useColorScheme` only to pick the variant of a third-party component, such as a sign-in button that comes in a light and a dark version.
- Use the `role` and `aria-*` props, because they are the web standard and each state is its own prop, so a caller's `...rest` can't overwrite them all at once as it would an `accessibilityState` object. Use an `accessibility*` prop only when it has no `aria-*` alias, such as `accessibilityHint`.
- In a component that passes `...rest` on, put the props a caller may override before `{...rest}`, the props the component owns after it, and the caller's `style` last in the style array, so callers can change the defaults and the layout without breaking the component.

🟢 Do this:

```tsx
type ProfileFormProperties = {
  onSave: () => void;
};

export function ProfileForm({ onSave }: ProfileFormProperties) {
  const [email, setEmail] = useState("");

  const userProfile = useQuery({
    queryFn: getUserProfile,
    queryKey: ["user-profile"],
  });

  const updateProfile = useMutation({
    mutationFn: saveProfile,
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
        label={messages.profileForm.emailLabel}
        onChangeText={handleChangeEmail}
        value={email}
      />
      <Button
        disabled={!isEmailChanged}
        onPress={handleUpdateProfile}
        title={messages.profileForm.updateProfileButton}
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
  const [email, setEmail] = useState("");

  const query = useQuery({
    queryFn: getUserProfile,
    queryKey: ["user-profile"],
  });

  const mutation = useMutation({
    mutationFn: saveProfile,
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
        label={messages.profileForm.emailLabel}
        onChangeText={onEmailChange}
        value={email}
      />
      <Button
        disabled={!changed}
        onPress={submit}
        title={messages.profileForm.updateProfileButton}
      />
    </>
  );
}
```

## Messages

All the text that users see or hear lives in `src/utilities/messages.ts`, so it can be reviewed in one place, translated later, and shared by every file that shows the same message. When you add or change a message, follow these rules:

- Group messages by the screen or component that shows them, in `camelCase` and without `Screen`, such as `withEmail` for `WithEmailScreen`. Put an error in the shared `error` group only when more than one file shows it, such as `error.emailInvalid`.
- End each key with the role of its message, such as `app.signOutButton` or `withEmail.emailLabel`, so the path reads as one name and a key used in the wrong role stands out. Name a key in `error` after its subject and then its state, such as `error.otpCodeExpired`.
- Reuse a key only for the same message in the same role, such as an error in the error group. Otherwise, give each use its own key even when the text matches, because the two can change separately later. This is why `@ankaa/no-duplicate-string` is off in `messages.ts`.
- Address users as "you", and never write "we", as Apple recommends at https://developer.apple.com/design/human-interface-guidelines/writing: "The server can't be reached", not "We couldn't reach our server".
- Use the words that users know, even when the code uses a different name: users see "verification code" where the code says `otpCode`. Once a word is in `messages.ts`, keep using it, such as "resend" for sending a verification code again.
- Write an accessibility hint only when the label doesn't already make the result clear, because VoiceOver reads the hint after the label, so repeating the label only slows users down. Write it as a third-person verb with a final period, such as "Sends a new verification code to your email address."
