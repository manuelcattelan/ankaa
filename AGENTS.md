# Ankaa

These rules describe how the code in this repository looks, reads and is structured, so the codebase stays consistent as it grows. Follow them exactly.

The `AGENTS.md` files in this repository hold only the rules that tooling can't check. ESLint, TypeScript and Prettier check everything else. A new rule that tooling could check belongs in the tooling, not in these files: don't add it yourself, but propose it instead, because how to enforce it needs its own decisions.

Before you create new files or edit existing ones in a workspace, read the `AGENTS.md` at the root of that workspace if it has one, because an agent doesn't always load it on its own.

## When no rule applies

The codebase is the reference for every case that these rules and tooling don't cover. In those cases, look for a pattern: how the codebase already shapes, names, words or places one kind of code, such as a provider or an error message, whatever that code does.

- Follow the pattern that fits what you're writing, but not its mistakes: where the code that shows the pattern breaks one of these rules, follow the rule and report the violation in the 📌 list below. Don't fix that violation yourself, because each fix needs its own decision.
- If no pattern fits, stop and ask before you write the code, because a guess becomes a pattern that the next agent copies. If you can't ask, such as in a subagent, stop and return this message as your result:

  ```markdown
  🛑 **No rule or pattern for <the decision you need>**

  - **Context:** <what you're writing, where it goes and why the decision comes up>
  - **Rule proposal:** <one sentence, written like the rules in this file>
  - **Implementation proposal:** <the code or name you would write by following the rule proposal, and what the documentation of the library does, if it covers the case>
  ```

- When you followed a pattern because no rule covered the case, end your final message with this list, so that each pattern can be checked and turned into a rule:

  ```markdown
  📌 **Patterns followed**

  - **<the pattern, in a few words>**
    - **Context:** <what you wrote, where it goes and why no rule covered it>
    - **Existing code:** <where the pattern comes from, in plain words, and a snippet of it>
    - **Rule violation:** <only when the existing code breaks one of these rules: which rule, and how you followed it instead>
    - **Rule assessment:** <whether a rule would make agents follow this pattern more reliably, and why>
    - **Rule proposal:** <only when the rule assessment says yes: one sentence, written like the rules in this file>
  ```

Write the context in both templates above for a reader who doesn't know the codebase.

## Naming

- Write every name, message and document in American English, so the whole codebase shares one vocabulary and every word has one meaning.
- Write every word in full, because a shortened word can mean more than one thing, but keep an acronym as it is, because readers know it better than its full form.
- Start every name with the concept it belongs to, and end it with what it is. A name must read right without the code around it, so add the concept whenever the bare noun could mean more than one thing.

  When a new name joins a concept, rename the existing names of that concept in the same change, because two names for one concept confuse every later reader.

  🟢 Do this:

  ```ts
  const COOLDOWN_SECONDS = 60;
  const COOLDOWN_INTERVAL_MILLISECONDS = 1_000;
  const [emailValidationError, setEmailValidationError] = useState<string>();
  ```

  🔴 Don't do this:

  ```ts
  const COOLDOWN_SECONDS = 60;
  const COUNTDOWN_INTERVAL_MILLISECONDS = 1_000;
  const [validationError, setValidationError] = useState<string>();
  ```

- Put a verb in front of a function name and a prefix in front of a boolean name, then follow the order above, as in `getAuthenticationErrorMessage`. Components and hooks are named by the rules in `apps/mobile/AGENTS.md`.
- Choose the boolean prefix by meaning: `is` for a state, `has` for something owned or already done, `can` for a capability and `should` for a decision, because lint requires one of the four but can't tell which one fits.
- Give each concept one name, and use the whole name in every identifier, file and route that refers to it, so a search for the name finds every place the concept appears. Use the word and the verb that the codebase already uses, even when the documentation of a library uses a different one.

  🟢 Do this:

  ```ts
  const OTP_CODE_LENGTH = 6;
  const [otpCode, setOtpCode] = useState("");
  const [otpCodeValidationError, setOtpCodeValidationError] =
    useState<string>();
  ```

  🔴 Don't do this:

  ```ts
  const CODE_LENGTH = 6;
  const [otp, setOtp] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState<string>();
  ```

- Name an array callback parameter after the singular of the array, as in `users.map((user) => user.id)`, not with a generic name such as `item` or `entry`, so the reader knows what each element is without looking up the array.

## Destructuring

Values that calls return are handled the same way everywhere.

- Destructure arrays that calls return.
- Never destructure objects that calls return. Keep the object and read its properties.
- Always destructure an object parameter in the function signature.

Do:

```ts
const session = authenticationClient.useSession();

const email = session.data?.user.email;
```

Don't:

```ts
const { data: session } = authenticationClient.useSession();

const email = session?.user.email;
```

## Values

A value has one way to be written, so its meaning is always clear.

- Give `1` a named constant when it is a limit, a count, a threshold or a version. Do not name it when it is arithmetic, as in `index + 1`.
- Write a plain string where you use it. Move it to a constant only when the file uses it twice, or when another file needs it. Numbers and regular expressions always get a named constant, because they don't say what they mean.
- Use `undefined` for a missing value. Use `null` only to render nothing in JSX, or where a library requires it.

  Do:

  ```ts
  const [emailValidationError, setEmailValidationError] = useState<string>();
  ```

  Don't:

  ```ts
  const [emailValidationError, setEmailValidationError] = useState<
    string | null
  >(null);
  ```

- Use `async` and `await`. Never use `.then()` or `.catch()` on a promise.

## Blank lines

A blank line ends a step, so the reader sees the steps of the work at a glance.

- Put the statements that do one step together, and separate two steps with one blank line.
- Declaring related values is always its own step, at every level of the file.
- Starting work that reaches outside the component, such as a request or a navigation, is always its own step, apart from the state changes that prepare it.

Do:

```ts
setEmailValidationError(undefined);
sendOtpCode.reset();

const parsedEmail = z.email().safeParse(email.trim());
```

```ts
setOtpCodeValidationError(undefined);
resendOtpCode.reset();
validateOtpCode.reset();

resendOtpCode.mutate({ email });
```

Don't:

```ts
setEmailValidationError(undefined);
sendOtpCode.reset();
const parsedEmail = z.email().safeParse(email.trim());
```

```ts
setOtpCodeValidationError(undefined);
resendOtpCode.reset();
validateOtpCode.reset();
resendOtpCode.mutate({ email });
```

## Structure

Every piece of code has one obvious place.

- Keep code in the file that uses it, below the main export. When a second file needs it, move it to the directory that matches its role.
- When the same logic or the same JSX structure appears a second time, turn it into one function or one component.
- Import from another workspace through `@ankaa/<name>`. Inside packages and the server, use relative imports with the `.ts` extension.
- Use named exports. Use a default export only where a framework requires it.
- Write an `index.ts` that re-exports other files only as the entry point of a package, or where a tool requires it.
- Order every file this way:
  1. imports
  2. types
  3. constants
  4. statements that run when the module loads, such as `GoogleSignin.configure()`
  5. exports
  6. private helpers
  7. `styles`

## Messages for developers

Errors and logs are read by developers, so they are short and factual.

- Write thrown errors, log messages and validation messages as one clause in sentence case, without a final period.
- Write a failure as `Failed to <verb> <object>` and a validation message as `<Subject> must <expectation>`.
- Put interpolated values in double quotes. Pass the error object to the logger instead of adding it to the message.

Do:

```ts
request.log.error(error, `Failed to handle tRPC request on path "${path}"`);
```

Don't:

```ts
request.log.error(`Error in tRPC handler on path '${path}': ${error}`);
```
