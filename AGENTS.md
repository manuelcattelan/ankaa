# Ankaa

These rules cover what the code, ESLint, TypeScript and Prettier can't show. Lint checks everything else, and each lint message states its reason.

Before you work in a workspace, read its `AGENTS.md`. Before you write or change a test, read `TESTING.md` at the root of the repository.

When a change makes a document wrong, update the document in the same change. Don't add a rule to these documents on your own: a rule enters them from a spec, or from a suggestion the maintainer accepts.

## Structure

- Keep code in the file that uses it, and move it when a second user needs it: to its Feature's role folder when a second file of the Feature needs it, to `shared/` when a second Feature needs it, and to the package that owns its concept when another workspace needs it, so each piece of code sits either where it's used or where its role says.
- Share code from its second copy when every change to one copy would have to be made to the other, and extract only the part that is the same rule. Never share code that only looks alike, because the wrong abstraction costs more than the duplication ([Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction), after Martin's true and accidental duplication in _Clean Architecture_).
- Move a dependency to the pnpm [`catalog:`](https://pnpm.io/catalogs) in `pnpm-workspace.yaml` once a second workspace depends on it, and refer to it as `catalog:` in every workspace that does, so all workspaces share one version and an upgrade lands in one place.

## Naming

Names follow the rules of Deißenböck and Pizka's [Concise and Consistent Naming](https://doi.org/10.1007/s11219-006-9219-1), because they give the same name every time. The Google TypeScript Style Guide and lint cover everything else about names, such as casing and abbreviations.

Every name stands for a **concept**: a unit of meaning from the product, the architecture, a library or plain English. `GLOSSARY.md` holds the product and architecture concepts. Add a concept only when the code must tell it apart from another, because every concept lengthens the names that carry it.

- **Consistency.** Give each concept exactly one name, and each name exactly one concept, with no synonyms and no homonyms. Before you name something, search the code for the name its concept already has. When a concept's name changes, rename every identifier of it in the same change, because each old name left behind becomes a synonym.

  🟢 `workoutId` in every file, and `RoutineNotFoundError` next to `WorkoutNotFoundError`.<br>
  🔴 `workoutId` in one file and `workoutIdentifier` in another, or two different errors both named `NotFoundError`.

- **Correctness.** Name a value after its concept or a more general one, never after something it isn't.

  🟢 `const plannedSets = routineExercise.sets`.<br>
  🔴 `const recordedSets = routineExercise.sets`, since a Routine exercise only plans its Sets.

- **Conciseness.** Name a value after exactly its concept, not a more general one, so the name tells it apart from every other value of the general concept. Locals and parameters are the one exception, below.

  🟢 `routines.map((routine) => routine.id)`.<br>
  🔴 `routines.map((item) => item.id)`.

- **Composition.** Write a compound name as modifiers followed by a head, so the whole names a kind of its head, as a `LinkedHashMap` is a kind of `HashMap`, which is a kind of `Map`. A name that starts with a verb, such as `saveRoutine`, reads as a sentence and is outside this rule.

  🟢 `routineSaveInputSchema`, `RoutineNotFoundError`.<br>
  🔴 `schemaRoutineSaveInput`, `ErrorRoutineNotFound`.

- **Members.** A property, a method, or a key of an object parameter drops the concept that its object or function already names, because the code always reads it through that object ([Swift's guidelines](https://www.swift.org/documentation/api-design-guidelines/)). An export keeps its whole concept, because the code reads it alone.

  🟢 `routine.name`, `routineRepository.save({ input, userId })`, `export function routineListQueryOptions`.<br>
  🔴 `routine.routineName`, `routineRepository.saveRoutine({ routineSaveInput, userId })`, `export function listQueryOptions`.

- **Locals and parameters.** A local or parameter may take the name of a more general concept when no other value in its function belongs to that concept, because a narrow scope keeps a short name clear ([Feitelson](https://doi.org/10.1109/ICPC58990.2023.00037)). When two values do, each keeps the modifier that tells it apart.

  🟢 In `save`, `const outcome = decideRoutineSave(…)`, next to `routineWithSameName` and `routineWithSameId`.<br>
  🔴 In `save`, `const routineSaveOutcome = decideRoutineSave(…)`, next to `routine` and `otherRoutine`.

- **Library constructs.** When you write a construct that a library documents, use the name its docs always give it, even an abbreviation, and even over a name the code already uses, because agents follow a library best when the code reads like its docs. When two libraries meet, the one whose construct you're writing decides. A name that the docs change with the domain, and every name of our own concepts, follows the rules above.

  🟢 `({ ctx, input })` in a tRPC procedure, `const db = drizzle(…)` inside the `Database` Service, `Database.layerNoDeps`.<br>
  🔴 `({ ctx: context, input })`, `const database = drizzle(…)`, `const betterAuthenticationClient = createAuthClient(…)`.

- **Constants.** Use `CONSTANT_CASE` for a module-level `const` whose value is written in the code: a literal, or an object or array built from literals, inline functions and other constants. Use `lowerCamelCase` for every other value, so a reader tells a fixed value from one created at runtime.

  🟢 `const MAXIMUM_ROUTINE_NAME_LENGTH = 100`, `const ROUTINE_MESSAGES = { notFound: "…" }`, `const tempoFilter = Schema.makeFilter(…)`.<br>
  🔴 `const maximumRoutineNameLength = 100`, `const routineMessages = { notFound: "…" }`, `const TEMPO_FILTER = Schema.makeFilter(…)`.

## Conventions

The [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) is the base guide, and lint enforces our departures from it. Lint can't check these:

- Write a comment only to say why, such as a workaround, a library quirk or a constraint, with a link to its source, and never to restate the code. Prefer JSDoc on exports and on APIs that other code uses.
- Name a string, a 0 or a 1 when it's a setting, a limit, unclear, or used twice or more, and keep it inline otherwise. Lint names every other number.
- Write an object type inline, and name it only when it's exported or used twice or more.
- Type a data field that can be empty as `T | null`, never as optional, and keep `undefined` for an optional parameter, option or prop, because `null` means empty and `undefined` means missing ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)).

  🟢 `type Routine = { note: string | null }`, `function RoutineCard({ onPress }: { onPress?: () => void })`.<br>
  🔴 `type Routine = { note?: string }`, `function RoutineCard({ onPress }: { onPress: (() => void) | null })`.

- Give every function you define one parameter, or one object when it needs several values, so every call names its arguments. Keep the shape of a signature that a library dictates, such as a reducer, an array callback or a tRPC resolver.
- Group statements into paragraphs by meaning, with one blank line between paragraphs and none inside one.
- Group several exports in one file only when grouping is the clean choice, such as a concept's constants or a Feature's tables, and name the file after the concept they share.

## Architecture

Both apps follow one architecture: the Core makes every decision in plain TypeScript, and the Shell does every I/O in Effect programs, so every decision is tested with no Runtime and no Fakes.

- Pass the current time and every random value, such as a new id, to the Core as parameters, and never read a clock or a random source in it, so the Core stays pure.
- Make a Core decision return its Outcome, and never throw: its success, or the error of the rule it breaks, so the Shell handles every Outcome in one exhaustive `Match`.
- In a Shell program, read, then decide, then write, and never read after the first write, so the program stays free of branching ([Seemann's Recawr sandwich](https://blog.ploeh.dk/2025/01/13/recawr-sandwich/)).
- Make a failure a typed error when it's anticipated and a caller acts on it, such as a broken rule. Let an anticipated failure that no caller acts on, such as a failure of the database, die where it's caught, and leave every failure that isn't anticipated a defect, as [Effect's own example](https://github.com/Effect-TS/effect/blob/7f524e25cfb49a71ac39b0f44278d08d40dda5de/ai-docs/src/51_http-server/fixtures/server/Users.ts) does. So Repositories and server Application Services list only Wire errors, while a mobile Application Service also lists the failures its screens act on that never cross the wire, such as the server being unreachable or the User canceling a sign-in.
- Put a Feature's business operations in its Application Service and its reads and writes in its Repository. Keep an Infrastructure Service a thin wrapper over one library or device API, with its failure mapping in a pure Core function, because tests replace the Service whole and would leave any logic inside it untested.
- Give an Infrastructure Service that wraps an API client one generic `request(call)` method, which runs the call with `Effect.tryPromise` and keeps the original error as `cause`, so every call fails the same way, while the client's own types already name each operation.
- Read each setting with Effect `Config` inside the Layer that needs it, never when a module is imported, so a bad setting fails at boot and importing has no side effects. A configuration file that a CLI loads, such as `drizzle.config.ts`, reads `process.env` directly and throws, because no Runtime runs it.
- Validate with Effect Schema, never with a hand-written predicate or parsing, as [Effect's guide](https://github.com/Effect-TS/effect/blob/7f524e25cfb49a71ac39b0f44278d08d40dda5de/LLMS.md) requires.

## Glossary

`GLOSSARY.md` defines this project's ubiquitous language, the one vocabulary that conversations, specs, code, and documentation all share, and the glossaries listed in its `Glossary tree` section add the terms for their directories. Before you answer a question, explain something, or write code or documentation that involves a project concept, read them, and then use only their terms, even when the user or the code uses another word: when a word is on an entry's `Avoid` line, write that entry's term instead. Never use a term from a `## Deprecated` group in new code or documentation. When its `Deprecated` line names a replacement, use that term instead; when it names none, the concept no longer exists: leave the term out, and leave any remaining use of it to `/upkeep` instead of raising it with the user. When a concept you need has no entry, say so instead of coining a term.
