# Testing

These rules describe how the tests in this repository are written and run, so agents can trust them to check their own work. They add to the rules in `AGENTS.md` and use the terms of `GLOSSARY.md`. Lint checks what it can in test files, and these rules cover the rest.

## Running tests

- Run every test of the repository with `pnpm test` at the root. It runs the `test` script of each workspace through turbo, which caches the results like `lint` and `check-types`, so a run with no change since the last one replays it instead of running the tests again.
- Run the tests of one workspace with `pnpm --filter <package> test`, and the tests of one file with `pnpm --filter <package> test <file>`, such as `pnpm --filter @ankaa/core test src/shared/filters/tempo-filter.test.ts`. Write the path of the file from the root of the workspace, or as an absolute path, because Vitest matches it against the paths inside the workspace, and a path from the root of the repository finds no test.
- Vitest prints only the tests that fail when it detects an agent, so a run that passes prints only a summary.
- Give a workspace a `test` script only once it has a test, because Vitest fails a run that finds no test file.

## General rules

- Put each test file next to the file whose export it calls, and name it after that file followed by `.test.ts`, or `.test.tsx` for a component, such as `tempo-filter.test.ts` for `tempo-filter.ts`. A search for a unit then finds its test, and the lint rules of the folder apply to the test too.
- Write one test at a time. Run it, and see it fail for the expected reason before you write the code that makes it pass, because a new test that passes on its first run usually checks nothing. An import error or a type error isn't the expected reason. When the test covers code that already exists, break the rule in that code for a moment, see the test fail, then restore the code.
- Treat the existing tests as the specification. Never edit, delete or skip a test to make the code pass. A test changes only when the user has changed the requirement it checks. When you believe a test is wrong, stop and report why instead of changing it.
- Swap behavior only through the Layers of a Service: use the real implementation wherever a test can run it, a fake where it can't, and `Layer.mock` for a Service that the test needs only in part. Never mock a module of this repository with `vi.mock` or `jest.mock`, because a test built on such mocks breaks whenever the code is reorganized, even when its behavior stays the same.
- A fake is a working implementation of a Service, written by hand for tests, that takes a shortcut the real implementation can't take, such as keeping in memory the emails it would send. Each fake is the static `layerTest` of its Service.
- Check the state and the results that the code under test produces, never which functions it called, because a test of the calls breaks when the code reaches the same result another way. When a fake records what the code did through it, such as the emails sent, check what it recorded.
- Write each test as straight-line code with literal expected values: no loops, no conditionals and no expected value that the test computes, because an expected value computed the way the code computes it passes even when both share the same bug. A setup helper that several tests share is fine for the details that don't matter to the behavior under test.
- Give each unit or procedure under test one `describe`, named after it, such as `describe("tempoFilter")` or `describe("routine.save")`. Let each `it` state the scenario and the expected result in one sentence, such as `it("rejects an Amount of 0 as less than 1")`, and check one behavior.
- Separate the given, the when and the then of each test with a blank line, and write no comments. When the then wraps the when, such as a call that must throw, write them as one statement.
- Write no test of its own for code without logic of its own, such as a constant, a Schema without a Filter, a route file, a Layer that only wraps a library, or Query options and mutation options, because such a test checks nothing that can break on its own. The tests of the code that uses it cover it.
- When you find a defect while you write tests, report it in your final message, and write no test that pins it, with `it.fails` or otherwise, because each fix needs its own review.
- Put a helper that several test files of one workspace use in the `src/shared/testing/` folder of that workspace, and a helper that several workspaces use in `@ankaa/vitest`, as the rules of `AGENTS.md` place shared code.

## Core

- Test a Core function by passing it values and checking the values it returns, including each of its Outcomes, with no Runtime and no test double.
- Import `describe`, `expect` and `it` from `@effect/vitest`, which re-exports Vitest.
- Test a Filter through a Schema that the test builds with it, such as `Schema.Number.check(amountFilter)`, and decode the input with `Schema.decodeUnknownSync`.
- For each rule that a Filter checks, write one test that accepts a valid value, at the limit of the rule when it has one, and one test that rejects an invalid value. Check the rejection with `toThrow` and the message of the broken rule, followed by its path when the value is nested, such as `'Must be unique\n  at ["exercises"]'`.
- In the test of a Schema, cover the rules that the Schema itself adds: its private Filters, its checks on arrays and structs, and each place where it applies a shared Filter, with one rejected value there. The other rules of a shared Filter are covered once, in the test of that Filter.
- Build the inputs of a Schema test from module-level constants that each hold one valid value, such as `ROUTINE_SAVE_INPUT` and `ROUTINE_EXERCISE_SET`, and spread them to change only the field that the test is about, so each test shows the one thing that differs.

## Procedures

- Test the behavior of a procedure through the tRPC caller, as a client would call it, and write no test of its own for an Interactor or a Database query, so refactoring them breaks no test. One call through the caller covers `requireSession`, the runner, the Interactor, the Core and the Database queries.
- Put the tests of the procedures of a Feature in `router.test.ts`, next to the `router.ts` of the Feature in `packages/api`, with one `describe` for each procedure, named after its path, such as `describe("exercise.list")`.
- Build the caller with `createCallerFactory(appRouter)`, from `src/trpc/procedures.ts` and `src/trpc/router.ts`, and give it an inner context built with `createInnerContext({ runtime, session })`.
- Run the procedures against a real PostgreSQL database that belongs to the test file. The `globalSetup` of `@ankaa/vitest` starts a `postgres:18` container with Testcontainers, or reuses the one already running, and migrates a template database once for each set of migrations. In `beforeAll`, clone the template with `createTestDatabase()` and build the Runtime of the file with `createTestRuntime(testDatabaseUrl)`. In `afterAll`, dispose the Runtime before you drop the database with `dropTestDatabase(testDatabaseUrl)`, because disposing it closes the pool that is connected to the database:

  ```ts
  describe("exercise.list", () => {
    let testDatabaseUrl: string;
    let runtime: ReturnType<typeof createTestRuntime>;

    beforeAll(async () => {
      testDatabaseUrl = await createTestDatabase();
      runtime = createTestRuntime(testDatabaseUrl);
    });

    afterAll(async () => {
      await runtime.dispose();

      await dropTestDatabase(testDatabaseUrl);
    });
  });
  ```

- Keep the tests of one file independent of each other, because they share its database: sign in a new user in each test that needs one, and don't let two tests of one file create data that every user sees, such as Exercises, when either test reads all of it.
- Sign a user in through the better-auth instance built only for tests: run `createTestAuthentication()` on the Runtime of the file once, in `beforeAll`, create a user and its auth headers with `createTestUser(testAuthentication)`, and pass the session that `Authentication.getSession(headers)` returns to the inner context. Pass `session: null` to call a procedure without a session.
- Create the data that no procedure creates, such as Exercises, with the Drizzle tables of `@ankaa/database`, through the `Database` Service of the Runtime. Check what a mutation procedure wrote through a Query procedure where one exists, otherwise through the Outcomes of later calls, and read the database through `Database` only when neither shows the behavior.
- Write a procedure test as a plain `async` test that awaits the caller, not with `it.effect`, because the procedure runs on the Runtime of the file, with the real clock, so the test clock of `it.effect` doesn't reach it.
- Check that a procedure fails with `rejects.toMatchObject({ code: "UNAUTHORIZED" })` and the tRPC code it fails with. Never check the message of an `INTERNAL_SERVER_ERROR`: the caller skips the error formatter, so it carries the message of the original error, which HTTP clients never see.
- The test Runtime replaces Resend with `Email.layerTest(sentEmails)`, a fake that pushes each email it sends into the array that the test passes in, so a test checks the emails sent by reading that array.
- Read the settings of the tests from the `.env.test` of the workspace, which `vitest.config.ts` loads with `loadEnv`. Commit it with fake values only, and give it every setting that the Layers of the tests read, so a local `.env` never reaches a test. The URL of the database of each file isn't in it: `createTestRuntime` adds it with a `ConfigProvider` that takes precedence over the environment.
- Docker must run for the tests of a workspace whose Vitest config has the Postgres `globalSetup`, such as `@ankaa/api` and `@ankaa/server`, even to run one Core test there, because the `globalSetup` runs whenever a test is queued. With Colima, set `DOCKER_HOST` to its socket, because Testcontainers doesn't read Docker contexts.
- The container keeps running after the tests, so the next run starts faster, and runs started at the same time from several worktrees share it safely. Its old template databases, and the databases of runs that crashed, stay in it. To reset it, remove it with `docker rm -f $(docker ps -aq --filter label=org.testcontainers=true --filter ancestor=postgres:18)` while no test runs, and the next run creates a new one.

## HTTP

- Test with Fastify's `inject()` only the behavior that HTTP alone shows: the better-auth routes, the error and not-found handlers, `/health` and rate limiting. Test the behavior of a procedure through the caller instead, as the Procedures section describes, because one call through the caller covers it without HTTP.
- Put the HTTP tests in `application.test.ts`, next to `src/application.ts` in `apps/server`, with one `describe("applicationPlugin")`.
- Give each test a fresh Fastify instance that never listens, as Fastify's Testing guide does: in `beforeEach`, create it with `fastify()` and no options, and await `server.register(applicationPlugin, { runtime })`, and in `afterEach`, await `server.close()`. `inject()` boots the instance itself, so a test never calls `listen`.
- Build the Runtime and the database of the file as a procedure test does, with `createTestDatabase()` and `createTestRuntime(testDatabaseUrl)` in `beforeAll`, and dispose the Runtime before you drop the database in `afterAll`. The application plugin never disposes the Runtime: `src/server.ts` does, in its `onClose` hook, which a test leaves out.
- Send a request as a signed-in user with the headers that `createTestUser(testAuthentication)` returns, passed as `headers: Object.fromEntries(testUser.headers)`, so the request carries the session cookie that the better-auth instance of the app accepts.
- Add a route that only one test needs, such as a route that throws to reach the error handler, in that test, after `beforeEach` has registered the application plugin, so the route gets the error handler of the application and the hooks of its plugins, such as rate limiting.
- Check the status code with `response.statusCode` and the body with `response.json()`, against the literal shape that the handler or the plugin builds.
- The application plugin registers `@fastify/rate-limit` with its defaults, 1000 requests per minute for each IP address. Send the requests up to the limit with a setup helper in the test file, and give the test its own `remoteAddress` from the `192.0.2.0/24` range, which is reserved for documentation, so its requests count only toward its own limit.
- `@fastify/autoload` loads `src/plugins/` and `src/routes/` with Node's own `import()`, not through Vitest, so the routes run a second copy of the workspace code that they import. They still find the Services of the test Runtime, because Effect finds a Service by its identifier, but an `instanceof` check between the two copies fails, and Vitest's coverage doesn't reach those files.

## Mobile

- Jest runs the tests of `apps/mobile` with Expo's `jest-expo` preset, on Jest 29 as Expo SDK 57 requires, so the Expo modules that the Shell imports load with the stubs that `jest-expo` gives their native code. Run one file as in the other workspaces, such as `pnpm --filter @ankaa/mobile test src/shared/core/format-count.test.ts`. Jest reads the path as a regular expression, so it also runs every other test file whose path the expression matches.
- Use the globals `describe`, `expect`, `it` and `jest` without importing them, because Jest defines them in every test file and `@types/jest` types them for the whole app.
- Jest transforms a package in `node_modules` only when `transformIgnorePatterns` in `apps/mobile/package.json` lists it. The list keeps the packages of `jest-expo` and adds those that ship only ES modules, such as `effect`. When a test fails with `SyntaxError: Cannot use import statement outside a module` inside a package, add the name of that package to the list.
- Test the mobile Core as the Core section describes, with the globals of Jest in place of `@effect/vitest`.
- Compare an Outcome with `toEqual` and a literal object, such as `toEqual({ _tag: "WholeNumberBelowMinimum", minimum: 1 })`, and pass an Outcome to the function that maps it to a message the same way, such as `getEmailValidationErrorMessage({ _tag: "EmailInvalid" })`, because the constructors of an Outcome union are private to the file of its validator.
- Build each error that a Core function classifies the way the Shell builds it, such as `new AuthenticationError({ status: 429 })`, or `new TrpcError({ cause: TRPCClientError.from(<error response>) })` with an error response shaped like the one the server sends, so each `instanceof` check behaves as in the app.
- Give each fixture the type of the data it stands for, such as `const BENCH_PRESS_EXERCISE: Exercise = { … }`, so TypeScript checks that it matches what the server returns.
