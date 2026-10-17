# Ankaa

These rules describe how the code in this repository looks, reads and is structured, so the codebase stays consistent as it grows. Follow them exactly.

The `AGENTS.md` files in this repository hold the rules that tooling can't check, and the rules that tooling could check only at a cost greater than the mistakes it would catch. ESLint, TypeScript and Prettier check everything else. A new rule that tooling could check belongs in the tooling, not in these files: don't add it yourself, but propose it instead, because how to enforce it needs its own decisions.

Before you create new files or edit existing ones in a workspace, read the `AGENTS.md` at the root of that workspace if it has one, because an agent doesn't always load it on its own.

## Structure

- Keep code in the file that uses it. When a second file in the same workspace needs it, move it to the role folder that matches it, as the [Layout](#layout) section describes, so a reader finds each piece of code either where it's used or where its role says.
- When a file in another workspace needs it, move it to the package that owns its concept, such as a value set that both the server and the mobile app use, in `@ankaa/core`.
- Keep a copy in each file only when no package owns the concept, or when the two files run in different processes, such as `app.config.ts`, which Node runs at build time, and the app. Then end your final message with this list, so that a shared place can be planned for it:

  ```markdown
  ♻️ **Code duplicated**

  - **<what you copied, in a few words>**
    - **Context:** <what the code does, which files hold a copy and why each one needs it, and why it wasn't shared yet, with a short snippet only when the description doesn't make the code clear>
    - **Sharing assessment:** <whether sharing it now would gain more than it costs, including what breaks when the copies drift apart, and why>
    - **Sharing proposal:** <where it could live and what moving it there would take>
  ```

- When the same logic appears a second time, move it into one shared function, so a change lands in one place. Keep the copies separate only when another rule requires it, such as one handler per mutation in `apps/mobile/AGENTS.md`.
- List a dependency in the pnpm `catalog:` of `pnpm-workspace.yaml` as soon as a second workspace depends on it, and refer to it as `catalog:` in every workspace that depends on it, so all workspaces share one version and an upgrade lands in one place.
- Never write a file that only re-exports other files, known as a barrel file, and import each name from the file that defines it. Tree shaking is off in this Expo setup, so importing a barrel file bundles every module it re-exports and runs them all at startup, and a re-export gives every name a second place to look for it. Turborepo, Vite, Vitest and Bulletproof React all advise against barrel files.

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
- Name a module-level constant in `SCREAMING_SNAKE_CASE` when its value is written in the code, such as a number, a string, a regular expression, or an object or array built from such values and other constants, so a reader can tell a fixed value from one that's created when the code runs. Name it in `camelCase` when the code creates it when it runs or when it's the value that the file exists to export.
- Give `1` a named constant when it's a limit, a count, a threshold or a version, or use a library function whose name already says it, such as `Schema.isNonEmpty()` in Effect Schema, because lint lets `1` through and a bare `1` doesn't say what it limits. Don't name `1` in arithmetic, such as `index + 1`.

## Architecture

The whole repository follows one architecture, on the server and on the mobile app: a functional Core of pure functions makes every decision, and an imperative Shell of Effect programs does every I/O. `GLOSSARY.md` defines each term this section uses, such as Core, Shell, Service, Layer, Runtime, Composition root, Feature, Interactor, Filter, Outcome, Database query, Query procedure and Query options.

### Principles

- Split the code into the Core, which makes every decision, and the Shell, which does every I/O, on the server and on the mobile app, because it's the cheapest structure that makes everything testable, and it needs no framework. As Gary Bernhardt puts it, the Core is tested "with no test doubles", and the Shell has "few conditionals".
- Write the Core in plain TypeScript, so it runs anywhere, on the server, on the mobile app or in a test, without a Runtime. Effect's documentation defines an Effect as "a description of a workflow or operation that is lazily executed", which puts every Effect program in the Shell.
- In the Core, import only Effect's pure data modules, `effect/Schema`, `effect/Data`, `effect/Option`, `effect/Match`, `effect/DateTime` and `effect/Predicate`, and never `effect/Effect`, `effect/Layer`, `effect/Context`, `effect/ManagedRuntime` or any other module that runs or provides I/O. Schemas, Outcome unions and date math then share one vocabulary across the Core and the Shell, and the Core stays pure. Effect's `LLMS.md` says "All validation and domain modeling in Effect is done with `Schema`".
- Pass the current time and every random value, such as a new identifier, to the Core as parameters, and never call a clock or random function from it, such as `DateTime.nowUnsafe`, so the Core stays pure.
- Give no Schema in `@ankaa/core` decoding services, because Effect Schema is pure only while decoding requires no services.
- Make every Core function that checks a rule, or that can fail, return a discriminated union that covers each of its Outcomes, the success and every broken rule, and never throw. The Shell then turns each Outcome into a write, a no-op, a typed error or a message, so its handling is exhaustive. Mark Seemann recommends "defining a simple discriminated union" for this. Build Outcome unions with `Data.taggedEnum`, and handle them with `Match`, which fails to compile when an Outcome isn't handled. A pure computation that checks no rule, such as a formatter, a builder, a selector or a reducer, returns its plain value, because it has no Outcome other than its result. A validator on the mobile app checks rules, so it returns Outcomes too, and a separate Core function maps each Outcome to the message that users see, so the text never takes part in a decision, such as whether a form can be saved.
- Name the constructors of an Outcome union after its type, as in `const RoutineSaveOutcome = Data.taggedEnum<RoutineSaveOutcome>()`, and call them as `RoutineSaveOutcome.RoutineNotFound()`, so the type and the values that build it share one name and a search for the name finds both.
- Name a broken-rule Outcome after the error it becomes, without `Error`, such as `RoutineNotFound` for `RoutineNotFoundError`, name the success `<Concept><Operation>Allowed`, such as `RoutineSaveAllowed`, and name the Core function that returns them `decide<Concept><Operation>`, such as `decideRoutineSave`, so each Outcome reads like the result of the decision it comes from and leads straight to the error the Shell turns it into.
- Name an Outcome that succeeds without writing after the concept and the state that makes the write unnecessary, such as `WorkoutVersionAlreadySaved`, so the reader sees why the Shell writes nothing and doesn't mistake it for a broken rule.
- Name a validator on the mobile app `validate<Concept>`, such as `validateRoutineName`, its success Outcome `<Concept>Valid`, such as `RoutineNameValid`, and each broken-rule Outcome after the message it becomes, without `Error`, such as `RoutineNameEmpty` for `routineNameEmptyError`. Map its Outcomes to messages in `get<Concept>ValidationErrorMessage`, such as `getRoutineNameValidationErrorMessage`, so each Outcome leads straight to the message that users see, as a decision's Outcome leads to its error, and a search for the concept finds the validator, its Outcomes and the function that maps them.
- Write every `_tag` in PascalCase, as Effect's documentation does, so Outcome tags and error tags such as `"WorkoutNotFoundError"` share one case.
- In every Shell program, read, then decide, then write, and never read after the first write, as Mark Seemann's "Recawr" ordering does, so the Shell stays free of branching. When a decision must be atomic with its writes, as for a Workout Save or a Routine Save, run the reads, the Core call and the writes inside one transaction, so the transaction stays correct.
- When you move existing code into this architecture, keep its behavior exactly, so the change can be checked as a pure restructuring. Report the defects you find instead of fixing them, because each fix needs its own review.

### Effect

- Use Effect 4 as the dependency, error and effect system on the server and on the mobile app, because its patterns are opinionated and documented. Effect 4 has been stable since September 2026, with long-term support.
- Keep Fastify and tRPC as the server transport, and TanStack Query on the mobile app. Effect's HTTP and RPC modules are marked unstable, and the mobile app gets its types from `AppRouter`. Effect's Atom modules are unstable too, and have nothing like TanStack Query's persisted cache or its paused mutations that resume after a relaunch.
- Import every Effect module from its subpath, never from the root `effect`, because Metro doesn't tree-shake, and the root import pulls about 1.7 MiB of unminified source, against about 0.4 MiB for `effect/Effect`. Lint checks this only in the Core, so follow it everywhere else yourself.

  🟢 Do this:

  ```ts
  import * as Schema from "effect/Schema";
  ```

  🔴 Don't do this:

  ```ts
  import { Schema } from "effect";
  ```

- Write Effect code in the forms that Effect's documentation uses, because agents follow Effect's patterns best when the code looks like its documentation: classes that extend `Context.Service` and `Data.TaggedError`, generator functions passed to `Effect.gen` and `Effect.fn`, `Effect.catch`, and PascalCase keys in a `Data.TaggedEnum` type argument. The forms without classes would lose the `make` option of a Service and errors that can be `yield*`-ed. Lint allows exactly these forms. It still bans inline object types, because named types work fine.
- Wrap in a Service only what has an implementation to swap: the infrastructure, which is `Database`, `Email`, `Authentication` and `CurrentSession`, and on the mobile app the device and platform APIs, which are the API client, the better-auth client, Apple sign-in, Google sign-in, storage on the device, notifications, crypto and accessibility announcements. Write each one as a `Context.Service` class with static Layers.
- Give a Service that wraps an API client a `request` method that runs a call with `Effect.tryPromise` and fails with the error class of the Service, carrying the original error as `cause`, as `TrpcClient.request` does with `TrpcError`, `AuthenticationClient.request` with `AuthenticationError`, and the server's `Database.query` with `DatabaseError`. Every call through the client then fails the same way, and the code that maps the error can still read the original from `cause`.
- Write each business operation as an Interactor: a standalone `Effect.fn` function, one per file, that `yield*`s the Services it needs. Don't make business operations the methods of a Feature Service, because putting each method in its own file would expose its dependencies in the Service interface, which Effect's documentation advises against ("Avoid exposing … as a requirement"), or would need wiring code. Plain functions that yield Services are a documented Effect form, such as `repoNames` in Effect's `ai-docs`, even though Effect's `LLMS.md` generally says "Prefer using services to encapsulate behaviour".
- Make the `layer` of each Service provide its own default dependencies, and its `layerNoDeps` leave them open, as Effect's convention does, so a Composition root or a test can still swap any dependency through `layerNoDeps`. Within one Runtime, Effect memoizes Layers by reference, so a Layer that several Services share is built only once.
- Name a Layer `layer`, and each variant `layer` followed by a descriptive suffix, such as `layerNoDeps` and `layerTest`. Effect 4's migration guide and `LLMS.md` adopt "naming layers with `layer` … instead of v3's `Default` or `Live`". Keep `layerNoDeps` as Effect writes it, even though it shortens "dependencies".
- Write each Shell error as a `Data.TaggedError` class, the stable and simpler form that Effect's website documents. Don't use `Schema.TaggedError`, because errors become tRPC codes at the boundary, so serializing them brings nothing.
- Give each Service an identifier made of its package name, its subdirectory path and its class name, such as `"@ankaa/database/Database"`, because `LLMS.md` says the identifier "should include the package name and the subdirectory path to the service file", and `index.ts` adds no meaningful segment.
- In the Composition root of each app, build one application Layer, named `applicationLayer`, and one `ManagedRuntime` from it, because Effect's documentation says "Build one runtime from your application Layer, then use it anywhere you need imperative execution".

### Configuration and validation

- Read every setting with Effect `Config`, inside the Layer that needs it, and never parse the environment when a module is imported. A configuration error then becomes an error of that Layer, which the Runtime raises at boot, and importing a module has no side effects. Swap the source of the settings with a `ConfigProvider` when needed, such as in a test. The one exception is the settings that Fastify needs before the Runtime exists, such as `NODE_ENV`, which picks the logger that the application Layer itself takes: `apps/server/src/server.ts` reads them with one `Config` program, as `apps/server/AGENTS.md` describes.
- On the mobile app, declare settings with `Config` too, and let the Composition root install `ConfigProvider.fromUnknown` with one static `process.env.EXPO_PUBLIC_*` reference per variable. Expo inlines these variables only when the code reads them statically ("dynamically accessing its values will break inlining of environment variables"), and Effect's default provider reads `process.env` dynamically. `app.config.ts` keeps reading `process.env` directly, because Node runs it at build time.
- Let a configuration file that a CLI loads, such as `app.config.ts` or `drizzle.config.ts`, read `process.env` directly and throw on an invalid value, because the CLI loads it, not a Layer, so no Runtime is there to raise a configuration error, and throwing stops the CLI before it uses the invalid value.
- Validate with Effect Schema only: tRPC inputs, validation on the mobile app and configuration, and don't depend on zod. Two validation libraries would give each validation concept two names. Effect Schema decodes synchronously without a Runtime, every process in the repository can load it, including `app.config.ts` through Expo's loader, and no library in the repository needs zod: tRPC and better-auth accept Standard Schema.
- Pass every Effect Schema to a tRPC `.input()` through `Schema.toStandardSchemaV1`, because tRPC accepts Standard Schema.
- Write a rule that Effect Schema has no built-in check for as a Filter, such as an email check or a strict ISO date-time check. Put each Filter that both the server and the mobile app enforce in the `filters/` folder of `@ankaa/core`.
- Keep a Filter that only one file uses private in that file, such as the URL Filter in `url-schema.ts`, and give it its own file named after it only when a second file uses it: in `@ankaa/core` when both the server and the mobile app enforce it, or in the `core/` folder of its Feature otherwise. A Filter then sits next to the only code that uses it, and a shared file always has more than one reader.
- Name each Filter after the rule it checks, followed by `Filter`, such as `tempoFilter`, in a file of the same name in kebab-case, such as `tempo-filter.ts`, so a Filter reads as the rule it adds to a Schema and a search for the rule finds it.
- Run the repository on Node 26 or newer, which `devEngines` in the root `package.json` pins, because Effect requires Node 22.18 or newer.

### Data access

- Reach the database only through the `Database` Service. It holds one promise-based node-postgres Drizzle instance and one pool, which better-auth and the Features share. Its `query` and `transaction` methods wrap promises with `Effect.tryPromise` and fail with one `DatabaseError`, and it exposes the raw Drizzle instance for better-auth's adapter. Because the Core is plain TypeScript, a transaction callback can await the reads, call the Core and await the writes without running Effects inside it.
- Don't use Drizzle's Effect driver or `@effect/sql-pg`. better-auth's adapter can't use the Effect driver, `@effect/sql-pg` 4 can't share a pool, and `drizzle-orm@1.0.0-rc.4` crashes when its Effect driver is imported under Effect 4.0.5 (Drizzle issue #6162). A later move to the Effect driver then touches only `Database` and the Database queries.
- Don't write repository interfaces. Write each Database query in its own file in the `queries/` folder of its Feature, as a plain async function over a database or a transaction, with no business branching. The Core never sees the database and Layers let tests swap it, so grouping how queries are built is the only gain of a repository left, and this convention gives it.
- Create the pool in the `Database` Layer with `Effect.acquireRelease`, from `Config.Redacted("DATABASE_URL")`, so disposing the Runtime closes the pool.
- In an Interactor that decides inside a transaction, return the Outcome from the transaction callback, after writing only for the success Outcome, then map it to a typed error with `Match.valueTags` in `Effect.flatMap`, as `saveWorkout` does. The callback stays plain async code that runs no Effects, and every Outcome becomes a write, a no-op or a typed error in one exhaustive place.
- Inside a transaction that reads, decides and writes, handle the Outcome with `Match.valueTags` before you return it: map the success Outcome to a call of a private `write<Concept>` function in the file of the Interactor, such as `writeRoutine`, map every other Outcome to `() => Promise.resolve()`, and await the result, as `saveRoutine` and `saveWorkout` do. A new Outcome then fails to compile until the transaction says whether it writes, the callback has no `if`, and every write of the Interactor sits in one function that runs only after the Core has decided.
- In a transaction that reads, decides and writes, lock with `FOR UPDATE` the rows that the write changes, and leave unlocked the reads that only check that rows exist, so two concurrent writes to the same rows can't both decide on the same stale read, while the other reads don't block unrelated transactions.
- Let a Database query that writes filter only by what identifies the rows it changes, such as the `routineId` of `updateRoutineDeletedAt`, and don't repeat the checks of the Core in SQL, such as who owns the Routine or whether it's deleted, because the transaction has locked those rows and the Core has already decided, so a repeated check only adds a second copy of the rule that can drift from the first.

### Server

- Keep the one Runtime of the server in tRPC's inner context, because tRPC documents the inner context as the one that "doesn't depend on the request", meant for the database connection and for testing.
- Run the Interactor of every procedure through the one runner in `packages/api/src/trpc/run.ts`, as `apps/server/AGENTS.md` describes, because Effect's guidance is to recover from expected errors with typed operators and to report defects only at the boundary.
- Make `apps/server/src/server.ts` the Composition root of the server, as `apps/server/AGENTS.md` describes, so configuration errors and the errors of better-auth's initialization fail at boot. The database pool connects lazily, so a database that can't be reached fails the first query, not the boot.
- Keep pino as the logger of Fastify, and send Effect's logs to it through a custom `Logger.make` installed with `Logger.layer`. Effect's default logger is a plain-text console logger that knows nothing about HTTP, while pino gives request IDs, request and response logs, serializers, Fastify's own logs, JSON, redaction and worker-thread transports, and Fastify depends on pino either way. The mobile app keeps Effect's default logger.
- Give better-auth's CLI its own `better-auth.config.ts` at the root of `@ankaa/authentication`, which default-exports an instance built with the real Drizzle relations-v2 adapter and placeholder settings. Build its options with the one function that the `Authentication` Layer also uses, so the CLI and the app never drift apart. better-auth's CLI requires a module-level `auth` or default export, and a module-level instance in `index.ts` would bring back an instance created at import time.

### Mobile

- Run Effect on the mobile app through its one Runtime in three places only: TanStack Query functions, event handlers, including mutation callbacks such as `onError`, and React effects. React effects are needed because TanStack Query v5 queries have no `onError` callback, so announcing a query error happens in a `useEffect`. The one exception: a provider may run a module-level program through the Runtime in a `useReducer` or `useState` initializer, as `WorkoutDocumentsProvider` does, only when its initial state must be read synchronously from storage on the device, because reading it later would render an empty state first, and the effect that writes the state back would then erase what's stored. Effect's main modules run in this Expo app with no polyfills and no Babel or Metro configuration: Expo provides `TextDecoder`, and Hermes V1 keeps generators native.
- Write every Effect program of the mobile app in a module-level Shell file, and let components and hooks only run those programs through the Runtime, never compose an Effect inline, such as `runtime.runSync(announceMessage(message))` rather than `runtime.runSync(accessibility.announceMessage(message))`. React Compiler silently skips any component or hook that contains an inline `function*`, and module-level programs keep components free of Effect composition. Put a program that several Features run in `src/shared/interactors/`. Lint doesn't check this.
- Write a `use<Service>()` hook that returns the instance of a Service, such as `useAuthenticationClient()`, only when a library hook needs the raw instance, such as better-auth's `useSession`, because every other use of a Service goes through a module-level program.
- Make the root `src/app/_layout.tsx` the Composition root of the mobile app, and define the application Layer in `src/layer.ts`, as `apps/mobile/AGENTS.md` describes. Expo documents the root layout as the place for "initialization code" and "adding context providers", and Mark Seemann places the Composition root "at, or near, the entry point".
- Keep Query options and mutation options in the `queries/` and `mutations/` folders of their Feature, not inside hooks, as `apps/mobile/AGENTS.md` describes. TanStack Query's maintainer writes that "The queries file will contain everything React Query related", and prefers `queryOptions` to custom hooks.
- Write Query options and mutation options as factory functions that take the Runtime, such as `createRoutineListQueryOptions(runtime)`, and let components pass them the Runtime that `useRuntime()` returns. This follows tRPC's TanStack Query integration, with the Runtime in place of the tRPC proxy, and TanStack Query's `queryOptions` factories, and the Runtime is only available through React context, so options built when their module loads can't reach it. The root layout registers mutation defaults with the same factories.

### Layout

- Organize the code by Feature, and call it "feature" on the server and on the mobile app, so everything about one Feature sits together and agents find what to read and write. A Feature never imports another Feature, with two exceptions: a route file composes components of several Features, and a server Interactor calls the Interactors of another Feature.
- Inside each Feature, give each role its own folder, and create the folder only when it holds a file, so each file has a single responsibility and the folder says its role. `shared/` holds what several Features use, in the same role folders as a Feature, so it stays clear what is shared.
- `@ankaa/core` holds the Core code that more than one workspace runs, whether the server and the mobile app or two server workspaces, so pure code that several workspaces share has one home. It depends only on Effect. Its `features/<feature>/` and `shared/` folders hold:
  - `schemas/`: the Effect Schemas of data that crosses from one app to the other, mainly tRPC inputs.
  - `constants/`: value sets and limits, one file per concept, which database CHECK constraints, pickers and validation on the mobile app use.
  - `filters/`: the Filters for the rules that both the server and the mobile app enforce.
- `packages/api` holds:
  - `trpc/`: `context.ts`, `procedures.ts`, with the single tRPC initialization and its helpers, `run.ts`, with the runner, and `router.ts`, with the app router.
  - `features/<feature>/router.ts`: the procedures of the Feature.
  - `features/<feature>/interactors/`: one Interactor per file.
  - `features/<feature>/core/`: the pure decisions, row builders and result shaping that only the server needs.
  - `features/<feature>/queries/`: one Database query per file.
  - `features/<feature>/errors/`: the error classes of the Feature.
  - `shared/errors/` and `shared/queries/`: the error classes and the Database query helpers that several Features share.
- In an infrastructure package, such as `@ankaa/database`, `@ankaa/email` or `@ankaa/authentication`, `src/index.ts` holds the main Service of the package and `src/error.ts` its error class, because a file whose name the package already says doesn't repeat it. `@ankaa/authentication` adds `src/current-session.ts`, so Feature code can yield `CurrentSession` without depending on tRPC. `@ankaa/database` keeps its tables in `src/schema/`, one file per Feature, and `drizzle.config.ts` points at that folder, because drizzle-kit reads only the direct children of the folder.
- The mobile app uses the same role folders in `src/features/<feature>/` and `src/shared/`, as `apps/mobile/AGENTS.md` describes, including a `constants/` folder for the value sets and limits that only the mobile app uses. A constant that both the server and the mobile app use goes in `@ankaa/core` instead.
- Name each file in kebab-case after the one unit it exports, without dot notation, such as `save-workout.ts` for `saveWorkout`, so one rule covers the whole repository, the folder holds the role, and a search for an exported name finds its file. The exceptions are `index.ts` and the files that a folder has exactly one of, named after their role: `router.ts`, `run.ts`, `error.ts` and `layer.ts`, and, on the server, `server.ts`, `application.ts` and `logger.ts` in `apps/server/src/`, and `context.ts` and `procedures.ts` in `packages/api/src/trpc/`, which follow Fastify's and tRPC's own file names.
- Name a file that groups constants by concept after that concept in kebab-case, without a role suffix, such as `amount.ts` in a `constants/` folder, because the folder already says the role and the concept is what a reader looks for.
- Export one unit per file: a function, a component, a hook, a Service, an error class or a Schema. Keep the helpers that only this unit uses private in its file. Group several units in one file only where grouping is the point: messages and constants grouped by concept, a reducer with its action union, the types that describe only one unit's input or output, the outer and inner tRPC context in `context.ts`, as tRPC's documentation writes them, and the procedure helpers of the one tRPC initialization in `procedures.ts`.
- List the few exports of a package that has an `index.ts`, which are `@ankaa/database`, `@ankaa/email` and `@ankaa/authentication`, explicitly in its `package.json`, so each module has exactly one import path, as Node recommends. Give `@ankaa/core` and `@ankaa/api` `"exports": { "./*": "./src/*.ts" }`, and import them without extensions. With `"./*": "./src/*"`, TypeScript's auto-import writes `.js` specifiers that pass `tsc`, `tsx` and lint but fail in Node and Metro, and Metro ignores `null` exclusions, so the wildcard can't hide `index`.
- Inside a package, import its own files with relative paths that end in `.ts`, such as `import { amountFilter } from "../filters/amount-filter.ts"`, because the packages are ES modules set up for Node's own TypeScript support with `@tsconfig/node-ts`, where a relative import must name the exact file, and the import path of a package is for the other workspaces.

### Lint

The shared ESLint configuration in `tooling/eslint/` turns the boundaries of this architecture into lint errors, with `import-x/no-restricted-paths` and `no-restricted-imports`, so agents don't have to remember them:

- Core purity: `core/` folders and `@ankaa/core` import no `effect/Effect`, `effect/Layer`, `effect/Context`, `effect/ManagedRuntime` or root `effect`, and no React, React Native or Expo module. Without the ban on the root `effect`, lint couldn't tell `Schema` from `Effect`.
- Feature isolation: a Feature imports no other Feature, except for the two exceptions in [Layout](#layout).
- Database queries: in a package, `queries/` is imported only by the Interactors of its own Feature. On the mobile app, `queries/` holds Query options, which hooks and screens import.
- Route files: a route file imports only screens and components, and from packages only `expo-router`, for its params and navigators, and `react`. The root layout is the exception, as the Composition root.

Lint also allows the Effect forms listed in [Effect](#effect), and nothing wider.

### Seams

Each of these is where a test swaps behavior and observes results, so keep each one working when you change the code around it:

- Core functions, in plain TypeScript and in `@ankaa/core`: a test passes values and checks the values returned, including every Outcome, with no Runtime and no test doubles.
- Service Layers: every Service can be replaced through its Layers, `layerNoDeps` with a test Layer, and the configuration through a `ConfigProvider`. A test exercises an Interactor through the Services it yields.
- The tRPC app router and its inner context: a test builds the inner context from a Runtime made of test Layers and calls the procedures directly. This is the highest server seam below HTTP.
- The Fastify application plugin: a test registers it on a fresh Fastify instance that never listens, and exercises HTTP behavior, such as the better-auth routes and the error handlers, with `inject()`.
- The mobile Runtime and QueryClient, provided through React context: hooks, screens and mutation defaults receive a Runtime built from test Layers and a fresh QueryClient, instead of module-level instances.

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

Write the context of every template in this file for a reader who doesn't know the codebase.

## Glossary

`GLOSSARY.md` defines this project's vocabulary, and the glossaries listed in its `Glossary tree` section add the terms for their directories. Before you answer a question, explain something, or write code or documentation that involves a project concept, read them, and then use only their terms, even when the user or the code uses another word: when a word is on an entry's `Avoid` line, write that entry's term instead. When a concept you need has no entry, say so instead of coining a term.
