# Glossary

A mobile app where people plan their strength training and record the workouts they do.

## Exercise library

### Equipment

An object that an [Exercise](#exercise) needs, such as a barbell, a bench or a rack. A person's own body weight isn't Equipment.

- **Avoid**: gear, apparatus, implement

### Exercise

A movement from the exercise library that Ankaa provides, the same for everyone, such as Bench Press (Barbell). The same movement with different [Equipment](#equipment) is a different Exercise, such as Bench Press (Dumbbell).

- **Avoid**: movement, lift, exercise variation

### Muscle group

A muscle or group of muscles that an [Exercise](#exercise) trains, such as the chest or the front deltoid. An Exercise trains each of its Muscle groups either as primary, when it mainly works them, or as secondary, when they assist.

- **Avoid**: muscle, body part, target muscle

### Weight type

How the weight entered for an [Exercise](#exercise) is counted: the total lifted, the weight of one dumbbell or one side, the weight added to body weight, the weight taken off body weight as assistance, or no weight at all. Each Exercise has exactly one.

- **Avoid**: load type, weighting

## Routines and workouts

### Routine

A person's named, reusable plan for one training session: which [Exercises](#exercise) to do, in what order and how, and optionally the days of the week it's meant for.

- **Avoid**: plan, template, workout plan, session plan
- **Distinct from**: [Workout](#workout): a Workout records one time a person followed a Routine.

### Routine exercise

One place an [Exercise](#exercise) takes in a [Routine](#routine), with its own [Section](#section), note and planned [Sets](#set). When a Routine uses the same Exercise twice, each use is a separate Routine exercise.

- **Avoid**: planned exercise, routine entry, slot
- **Distinct from**: [Exercise](#exercise): the Exercise is the movement in the library, and a Routine exercise is one use of it in one Routine.

### Save

To send a [Routine](#routine) or a [Workout](#workout) to the server, which writes it to the database. A person saves a Routine from the editor. A Workout saves itself after every change, and the device [Stores](#store) it until its Save succeeds.

- **Avoid**: sync, upload, persist, submit
- **Distinct from**: [Store](#store): the device Stores a Workout, and a Save sends it to the server.

### Section

One of the three parts, done in order, that every [Routine](#routine) and [Workout](#workout) splits its exercises into: warm-up, main and cool-down.

- **Avoid**: phase, part, block, stage

### Skipped exercise

A [Workout exercise](#workout-exercise) the person marked as not done as planned, with a reason: low on time, low energy, pain or other, and an optional note. It keeps any [Sets](#set) recorded before it was skipped.

- **Avoid**: missed exercise, dropped exercise, abandoned exercise

### Store

To keep a [Workout](#workout) on the device, as its [Workout document](#workout-document), until its [Save](#save) succeeds, so no change is lost before the server has it.

- **Avoid**: save locally, keep offline
- **Distinct from**: [Save](#save): a Save sends the Workout to the server, and the device Stores it until that Save succeeds.

### Superset

Two or more [Routine exercises](#routine-exercise) or [Workout exercises](#workout-exercise), next to each other in one [Section](#section), done by alternating them one [Set](#set) at a time, with [Rest](#rest) only after one Set of each.

- **Avoid**: tri-set, giant set, compound set, paired set, circuit

### Warm-up exercise

A [Routine exercise](#routine-exercise) or [Workout exercise](#workout-exercise) that uses a different [Exercise](#exercise) to prepare for one exercise of the main [Section](#section), done right before it. It belongs to the main Section, with the exercise it prepares for.

- **Avoid**: specific warm-up, activation exercise, primer
- **Distinct from**: [Section](#section): an exercise in the warm-up Section prepares for the whole session, not for one exercise.
- **Distinct from**: [Warm-up set](#warm-up-set): a Warm-up set is a lighter Set of the exercise itself.

### Workout

One training session a person does, started from a [Routine](#routine) and recorded from the moment they start it until they stop it. A person has at most one Workout in progress at a time, and changing the Routine afterwards doesn't change a Workout already started.

- **Avoid**: session, training session, workout log, log
- **Distinct from**: [Routine](#routine): a Routine is the reusable plan, and each Workout records one time a person followed it.

### Workout document

A [Workout](#workout) as the device [Stores](#store) it: everything recorded so far, with a version number that every change increases and the version of its last successful [Save](#save), so the device knows which changes the server doesn't have yet.

- **Avoid**: local workout, workout draft, offline workout, cached workout
- **Distinct from**: [Workout](#workout): the Workout is what the person does, and the Workout document is the copy of it that the device keeps.

### Workout exercise

One place an [Exercise](#exercise) takes in a [Workout](#workout), copied from a [Routine exercise](#routine-exercise) when the Workout starts, with its own [Section](#section), note and recorded [Sets](#set). It keeps the [Weight type](#weight-type) and the kind of [Amount](#amount) the Exercise had at that moment.

- **Avoid**: performed exercise, logged exercise, workout entry
- **Distinct from**: [Routine exercise](#routine-exercise): the Routine exercise is the plan, and the Workout exercise records what was done against it.

## Sets

### Amount

How much of an [Exercise](#exercise) is done in one go: a number of [Repetitions](#repetition), or a number of seconds for an Exercise done for time, such as a plank. Each Exercise is measured in one of the two.

- **Avoid**: reps, duration, count, target, volume

### Drop set

A [Set](#set) whose first [Segment](#segment) is followed right away, without [Rest](#rest), by more Segments at a lower weight, each one called a drop. A [Routine](#routine) plans how many Segments, the first included, and can plan the percentage of weight to take off at each drop.

- **Avoid**: strip set, descending set, running the rack

### Intensity technique

A way of pushing a [Set](#set) past where it would end, by splitting it into several [Segments](#segment): a [Drop set](#drop-set) or a [Rest-pause set](#rest-pause-set). A Set has at most one.

- **Avoid**: variation, set variation, technique, method
- **Distinct from**: [To failure](#to-failure): To failure says when a Set ends, with or without an Intensity technique.

### Pyramid

[Working sets](#working-set) of one exercise whose [Amount](#amount) falls from Set to Set, such as 10, 8 and 6 [Repetitions](#repetition), or rises, such as 6, 8 and 10, which is a reverse Pyramid. A [Routine](#routine) plans one by giving each Set its own Amount.

- **Avoid**: pyramid set, ladder
- **Distinct from**: [Intensity technique](#intensity-technique): an Intensity technique changes one Set, and a Pyramid spans several.

### Repetition

One full cycle of a movement, such as lowering the bar to the chest and pressing it back up once.

- **Avoid**: rep

### Rest

The pause after a [Set](#set) before the next one, given in seconds for each planned Set and counted down during a [Workout](#workout). The short pauses inside a [Rest-pause set](#rest-pause-set) aren't Rest.

- **Avoid**: rest period, rest interval, break, recovery

### Rest-pause set

A [Set](#set) split into a planned number of [Segments](#segment), the first included, by pauses of a few seconds, usually at the same weight. Those pauses belong to the Set and aren't [Rest](#rest).

- **Avoid**: cluster set, myo-reps

### Segment

One uninterrupted stretch of a [Set](#set), with its own [Amount](#amount) and weight. A Set has a single Segment, unless it's a [Drop set](#drop-set), where each drop starts a new Segment, or a [Rest-pause set](#rest-pause-set), where each short pause starts a new one.

- **Avoid**: mini-set, sub-set, cluster

### Set

One run of a single [Exercise](#exercise) done without a break, such as 8 [Repetitions](#repetition) of Bench Press (Barbell), apart from the short pauses inside a [Drop set](#drop-set) or [Rest-pause set](#rest-pause-set). The same term covers a Set a [Routine](#routine) plans and a Set a [Workout](#workout) records.

- **Avoid**: series

### Tempo

The seconds each [Repetition](#repetition) spends lowering, paused at the bottom, lifting and paused at the top, written as four numbers such as 3-0-1-2. An X in third place means lifting as fast as possible.

- **Avoid**: cadence, rhythm, speed

### To failure

Said of a [Set](#set) done until the person can't complete another [Repetition](#repetition).

- **Avoid**: until failure, AMRAP, max effort

### Warm-up set

A lighter [Set](#set) done to prepare for the [Working sets](#working-set) of the same exercise, and left out of a [Workout](#workout)'s progress.

- **Avoid**: ramp-up set, feeder set, preparatory set
- **Distinct from**: [Section](#section): the warm-up Section holds whole exercises, and a Warm-up set is one Set of an exercise in any Section.

### Working set

A [Set](#set) done for the training its exercise is there for, rather than to prepare for it. A [Workout](#workout) counts its progress in Working sets only.

- **Avoid**: work set, main set

## Architecture

### Composition root

The one place in each app that builds the application [Layer](#layer) and the [Runtime](#runtime), and wires the rest of the app to them: `src/server.ts` on the server and the root `src/app/_layout.tsx` on the mobile app.

- **Avoid**: bootstrap, main module

### Core

The code that makes every decision, written in plain TypeScript: given values, it returns values, including an [Outcome](#outcome) for every rule it checks, and it never does I/O, reads the clock or throws. It lives in the `core/` folder of each [Feature](#feature), and in `@ankaa/core` for what both the server and the mobile app run.

- **Avoid**: domain, domain layer, business logic, pure layer
- **Distinct from**: [Shell](#shell): the Shell does the I/O and asks the Core for every decision.

### Database query

One Drizzle query of a server [Feature](#feature), in its own file in the `queries/` folder of that Feature: a plain async function over the database or a transaction, with no business branching. Only the [Interactors](#interactor) of the same Feature call it.

- **Avoid**: repository, data access object, DAO
- **Distinct from**: [Query procedure](#query-procedure): a tRPC procedure that the mobile app calls to read data.
- **Distinct from**: [Query options](#query-options): what TanStack Query uses on the mobile app to fetch and cache data.

### Feature

One area of the product, such as Workouts or Routines, whose code sits together in one `features/<feature>/` folder on the server, in `@ankaa/core` and on the mobile app. Features don't import each other, except when a route file composes components from several Features, or a server [Interactor](#interactor) calls an Interactor of another Feature. The `shared/` folder holds what several Features use, in the same folders a Feature has.

- **Avoid**: slice, vertical slice

### Filter

A reusable rule of an Effect Schema, made with `Schema.makeFilter` or taken from Effect's built-in ones, such as `Schema.isMaxLength`, and added to a Schema with `.check()`. `@ankaa/core` keeps the Filters that both the server and the mobile app enforce. Narrowing a list, such as the Exercises shown in a picker, isn't a Filter.

- **Avoid**: refinement

### Interactor

One business operation, such as saving a Workout, written as a standalone `Effect.fn` in its own file in the `interactors/` folder of a [Feature](#feature). It yields the [Services](#service) it needs, reads, asks the [Core](#core) to decide, and then writes. Robert C. Martin's interactors must not depend on the database, but ours are [Shell](#shell) programs, which on the server read and write through [Database queries](#database-query).

- **Avoid**: use case
- **Distinct from**: [Service](#service): a Service wraps an implementation that can be swapped, and an Interactor uses Services to carry out one operation.

### Layer

An Effect Layer: what builds a [Service](#service) when the [Runtime](#runtime) starts, reading its settings with Effect `Config` and taking the other Services it needs from their Layers. A Service's `layer` provides its default dependencies, its `layerNoDeps` leaves them open, and other variants carry a descriptive suffix, such as `layerTest`. The application Layer, `applicationLayer`, combines every Layer that one app needs.

- **Avoid**: live layer, default layer
- **Distinct from**: [Service](#service): code yields the Service, and the Layer is how the Runtime builds it.

### Outcome

One possible return of a [Core](#core) function, as a variant of the discriminated union that it returns: a success or a broken rule, with a PascalCase `_tag`. The Core returns an Outcome instead of throwing, and the [Shell](#shell) turns each one into a write, a no-op or a typed error.

- **Avoid**: result union, verdict

### Query options

The options, built with TanStack Query's `queryOptions`, that tell the mobile app how to fetch and cache one piece of server data. Each mobile [Feature](#feature) keeps its own in its `queries/` folder, as factory functions that take the [Runtime](#runtime), such as `createRoutineListQueryOptions(runtime)`.

- **Avoid**: query config, query hook
- **Distinct from**: [Database query](#database-query): a server function that reads or writes the database.
- **Distinct from**: [Query procedure](#query-procedure): the tRPC procedure that Query options may call.

### Query procedure

A tRPC procedure, defined with `.query()`, that the mobile app calls to read data, as opposed to a mutation procedure, which changes data. Each server [Feature](#feature) defines its procedures in its `router.ts`.

- **Avoid**: query route, read procedure
- **Distinct from**: [Database query](#database-query): a server function that a Query procedure's [Interactor](#interactor) calls to read the database.
- **Distinct from**: [Query options](#query-options): what TanStack Query uses on the mobile app to fetch and cache data.

### Runtime

The Effect `ManagedRuntime` that the [Composition root](#composition-root) of each app builds once from the application [Layer](#layer), and that runs every Effect program of that app. The server keeps it in tRPC's inner context, and the mobile app provides it through React context, read with `useRuntime()`. The JavaScript engine that runs the code, such as Node or Hermes, isn't a Runtime.

- **Avoid**: container, injector, executor

### Service

An implementation that can be swapped, such as in a test, wrapped in an Effect `Context.Service` class with static [Layers](#layer): infrastructure on the server, such as `Database`, `Email`, `Authentication` and `CurrentSession`, and device and platform APIs on the mobile app, such as the API client, storage on the device and notifications. Code yields a Service to use it.

- **Avoid**: adapter, port, gateway
- **Distinct from**: [Interactor](#interactor): an Interactor is one business operation, and a Service is something it uses.

### Shell

The code that does every I/O, such as reading the database, calling the server or showing a notification, and asks the [Core](#core) for every decision: [Services](#service), [Interactors](#interactor) and every other Effect program, and the code that runs them, such as tRPC procedures and React components.

- **Avoid**: I/O layer, effectful code, side-effect layer
- **Distinct from**: [Core](#core): the Core decides, and the Shell carries the decision out.
