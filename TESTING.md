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

## Core

- Test a Core function by passing it values and checking the values it returns, including each of its Outcomes, with no Runtime and no test double.
- Import `describe`, `expect` and `it` from `@effect/vitest`, which re-exports Vitest.
- Test a Filter through a Schema that the test builds with it, such as `Schema.Number.check(amountFilter)`, and decode the input with `Schema.decodeUnknownSync`.
- For each rule that a Filter checks, write one test that accepts a valid value, at the limit of the rule when it has one, and one test that rejects an invalid value. Check the rejection with `toThrow` and the message of the broken rule, followed by its path when the value is nested, such as `'Must be unique\n  at ["exercises"]'`.
- In the test of a Schema, cover the rules that the Schema itself adds: its private Filters, its checks on arrays and structs, and each place where it applies a shared Filter, with one rejected value there. The other rules of a shared Filter are covered once, in the test of that Filter.
- Build the inputs of a Schema test from module-level constants that each hold one valid value, such as `ROUTINE_SAVE_INPUT` and `ROUTINE_EXERCISE_SET`, and spread them to change only the field that the test is about, so each test shows the one thing that differs.
