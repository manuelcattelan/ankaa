---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/testing/**"
---

# Testing

These rules cover how tests are written and run in every workspace. Lint checks what it can in test files and `testing/` folders, and each lint message states its reason.

## Running tests

- Run every test with `pnpm test` at the root. Turborepo runs each workspace's `test` script, and replays the cached result of a workspace whose inputs haven't changed.
- Run one workspace's tests with `pnpm --filter <package> test`, and one file's with `pnpm --filter <package> test <path>`, such as `pnpm --filter @ankaa/core test src/shared/filters/tempo-filter.test.ts`. Write the path from the workspace's root, because the runner matches it against the paths inside the workspace, and a path from the repository's root finds no test.
- Give a workspace a `test` script only once it has a test file, because Vitest fails a run that finds none.
- Start Docker before you run the tests of a workspace whose Vitest configuration has the Postgres global setup, even to run one Core test there, because the global setup starts the database container whenever a test is queued. With Colima, set `DOCKER_HOST` to its socket, because Testcontainers doesn't read Docker contexts.
- The container outlives each run, so the next run starts faster, and runs started at the same time from several worktrees share it safely. The templates of old migrations and the databases of crashed runs stay in it. To reset it, run `docker rm -f $(docker ps -aq --filter label=ankaa.test-database)` while no test runs, and the next run creates a new one.

## Writing tests

- Write one test at a time, and see it fail for the expected reason before you write the code that makes it pass, because a test that passes on its first run usually checks nothing. An import or type error isn't the expected reason. For code that already exists, break the rule in the code, see the test fail, then restore the code.
- Never change what a test checks to make code pass, and when a test seems wrong, stop and report why. Changing only a test's setup, such as the signature of a helper, is fine.
- Never write a test that pins a defect, with `it.fails` or otherwise, because the rule above would then protect the defect. Report the defect instead.
- Write a test as straight-line code with literal expected values, and never compute an expected value, because a computed expectation repeats the code's logic and passes when both share a bug ([Google](https://testing.googleblog.com/2014/07/testing-on-toilet-dont-put-logic-in.html)). A setup helper that several tests share is fine for the details that don't matter to the behavior under test.

  🟢 `expect(formatRest(90)).toBe("1:30")`.<br>
  🔴 ``expect(formatRest(90)).toBe(`${Math.floor(90 / 60)}:${90 % 60}`)``.

- Separate the given, the when and the then with blank lines, and write no comments. When the then wraps the when, such as a call that must reject, write them as one statement.
- Name each `describe` after the unit or procedure it tests, such as `describe("tempoFilter")` or `describe("routine.save")`, and let each `it` state one behavior in one sentence, such as `it("rejects a Routine name that another Routine of the User already has")`.
- Put a test file next to the file whose export it calls, named after that file with `.test.ts`, or `.test.tsx` for a component.
- Write no test of its own for code without logic of its own, such as a constant, a Schema that adds no check, a route file, a Layer that only wraps a library, or Query options and Mutation options. Application Services and Repositories get no tests of their own either: procedure tests cover them on the server, and screen tests on mobile, so a refactoring below a procedure or a screen breaks no test ([Beck's Test Desiderata](https://testdesiderata.com/)).
- Run an Effect in a test through the test Runtime, as the app does: `await runtime.runPromise(program)` for a success, `await runtime.runPromiseExit(program)` for a failure or a defect, checked against literal values, and `runtime.runFork(program)` followed by `await runtime.runPromise(Fiber.interrupt(fiber))` for an interruption.

## Fakes

- When a test needs to see what the code did through a [Fake](GLOSSARY.md#fake), the Fake records it into an array or a `Map` that the test passes in, and the test checks what it recorded.
- Swap behavior only through a Service's Layers: the real implementation wherever a test can run it, a Fake where it can't, and `Layer.mock` for a Service that no default scenario reaches, so an unexpected use fails loudly.
- Export each Fake as a standalone Layer from the `testing/` folder of whatever owns its Service, never as a static of the Service class, because Metro doesn't tree-shake, so a static Fake ships in the production app. This departs from Effect's examples, such as `TodoRepo.layerTest`.
- Make a mobile default Fake behave like an idle device: nobody signed in, nothing in storage on the device, and no tRPC responses. A test then configures only the Fakes its scenario needs.

## Core

- Test a Core function by passing it values and checking the values it returns, every Outcome included, with no Runtime and no Fake.
- Test each rule of a Filter once, where the Filter is defined: one accepted value, at the rule's limit when it has one, and one rejected value, checked with its message.
- In a Schema's test, cover only the checks the Schema adds, with one rejected value at each place where it applies a shared Filter, because the Filter's own test covers its rules.
- Build the inputs of a Schema test from module-level constants that each hold one valid value, and spread one to change only the field the test is about, so each test shows the one thing that differs.

  🟢 `{ ...ROUTINE_SAVE_INPUT, name: "" }`.<br>
  🔴 `{ name: "", sections: [ … ] }`, with the whole input written out again.

## Procedures and HTTP

- Test server business logic through the tRPC caller, against real PostgreSQL, as a client calls it. One call covers the session check, the runner, the Application Service, the Core and the Repository.
- Each test file gets a database of its own, cloned from a migrated template, and its tests share it. So sign in a new User in each test that needs one, and never let two tests of one file create data that every User sees, such as Exercises, when either of them reads all of it.
- Check a failure by its tRPC code and the `_tag` of the Wire error in its `cause`, as in `rejects.toMatchObject({ code: "NOT_FOUND", cause: { _tag: "RoutineNotFoundError" } })`, because the `_tag` is what the mobile app acts on. Never check the message of an `INTERNAL_SERVER_ERROR`: the caller skips the error formatter, so the message is the original error's, which a client never sees.
- Check a write through a procedure that reads what it wrote, otherwise through the results of later calls, and read the database directly only when neither shows the behavior, so tests don't depend on the table layout. Insert data that no procedure creates, such as Exercises, through the `Database` Service.
- Test with Fastify's `inject()` only what HTTP alone shows: every better-auth endpoint the mobile app calls, the error and not-found handlers, rate limiting, the session read from the cookie, and the error formatter's wire encoding, covered once. Register the application plugin on a fresh Fastify instance that never listens, as [Fastify's testing guide](https://fastify.dev/docs/latest/Guides/Testing/) does.
- Send a rate-limit test's requests from a `remoteAddress` of its own in `192.0.2.0/24`, a range reserved for documentation, so they count only toward its own limit.

## Screens

- Test a screen by rendering the real route files with `renderScreen` at the URL a User opens, such as `renderScreen({ initialUrl: "/" })`, and put the test next to the screen. Run screen tests from `apps/mobile`, as `pnpm --filter @ankaa/mobile test` does, because `renderRouter` finds `./src/app` from the directory where Jest runs.
- Fake the transport under the real tRPC and better-auth clients, never a mobile Application Service, so the decoding of Wire errors and the session handling run the same code as in the app. A fake tRPC response fails by throwing a Wire error, as the server does.
- Find what the User sees by role and accessible name or by text, act with `userEvent`, and wait with `findBy*` or `waitFor`, following [React Native Testing Library's priorities](https://callstack.github.io/react-native-testing-library/docs/guides/how-to-query). Use a `testID` only for a native view that exposes neither a role nor text, and `fireEvent` only where `userEvent` can't reach, such as a native button whose view takes `onButtonPress`.
- Fake timers run in every test, with `setImmediate` left real, because Effect's scheduler runs fibers on it. Advance time only with `advanceFakeTime`, which runs inside `act`, so the state updates of the timers that fire apply before the test checks the screen. A timer scheduled before `renderScreen` never fires, because `renderRouter` reinstalls the fake clock.
- When a test fails with `SyntaxError: Cannot use import statement outside a module` inside a package, add the package to `transformIgnorePatterns` in `apps/mobile/package.json`, because Jest transforms only the packages listed there, and some ship only ES modules. A package's `.mjs` files go through the `.mjs` entry of `transform`, because `jest-expo` transforms only `.js`, `.jsx`, `.ts` and `.tsx` files.
