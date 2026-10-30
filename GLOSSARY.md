# Glossary

A mobile app where [Users](#user) plan their strength training and record the [Workouts](#workout) they do.

## Accounts

### Account

What a [User](#user) has in Ankaa: the ways they sign in and everything they own, such as their [Routines](#routine) and [Workouts](#workout). Ankaa creates it at their first sign-in, and each User has exactly one.

- **Distinct from**: [User](#user): the User is who trains, and the Account is what they have in Ankaa.

### Account deletion

Removing an [Account](#account) for good, at its [User](#user)'s request, together with everything it holds.

- **Avoid**: account removal, account closure, user deletion, erasure

### User

Someone who has signed in to Ankaa at least once and whose [Account](#account) hasn't been deleted, to plan [Routines](#routine) and record [Workouts](#workout) of their own.

- **Avoid**: person, lifter, athlete, member, customer

## Architecture

### Application Service

A [Service](#service) that holds the business operations of a [Feature](#feature), such as [Saving](#save) a [Routine](#routine), and asks the [Core](#core) for every decision they need.

- **Avoid**: use case
- **Distinct from**: [Repository](#repository): a Repository reads and writes the database for a Feature's operations, and an Application Service decides, through the Core, what to write.

### Composition root

The one place in each app that builds the [Runtime](#runtime) from every [Layer](#layer) the app needs, and wires the rest of the app to it.

- **Avoid**: bootstrap, main module

### Core

The code that makes every decision, in plain TypeScript: given values, it returns values, including an [Outcome](#outcome) for every decision, and it never does I/O, reads the clock, makes a random value or throws.

- **Avoid**: domain, domain layer, business logic, pure layer
- **Distinct from**: [Shell](#shell): the Shell does the I/O and asks the Core for every decision.

### Fake

A working implementation of a [Service](#service), written by hand for tests, that takes a shortcut the real one can't, such as keeping in memory the emails it would send.

- **Avoid**: stub, test double, in-memory implementation

### Feature

One area of the product, such as [Routines](#routine) or [Workouts](#workout), whose code is kept together in every workspace that has some.

- **Avoid**: slice, vertical slice

### Filter

A reusable rule that an Effect Schema checks beyond the shape of the data, such as a maximum length or the format of a [Tempo](#tempo). Narrowing a list, such as the [Exercises](#exercise) shown in a picker, isn't a Filter.

- **Avoid**: refinement

### Infrastructure Service

A [Service](#service) that wraps one piece of infrastructure or one device API, such as the database, sending email or notifications, and holds no business logic.

- **Avoid**: adapter, port, gateway

### Layer

What builds a [Service](#service) when the [Runtime](#runtime) starts, as Effect defines it: it reads the Service's settings and takes the other Services it needs from their own Layers.

- **Avoid**: live layer, default layer
- **Distinct from**: [Service](#service): code uses the Service, and the Layer is how the Runtime builds it.

### Mutation options

The options that tell TanStack Query on the mobile app how to run one change, such as a [Save](#save) or scheduling a notification.

- **Distinct from**: [Query options](#query-options): Query options fetch and cache server data, and Mutation options change something.

### Outcome

What a decision of the [Core](#core) returns: a success, or the rule it breaks, such as acting on another [User](#user)'s [Routine](#routine).

- **Avoid**: result union, verdict

### Query options

The options that tell TanStack Query on the mobile app how to fetch and cache one piece of server data.

- **Avoid**: query config, query hook

### Repository

A [Service](#service) that does the database reads and writes of one [Feature](#feature)'s business operations, such as reading the [Routine](#routine) that a [Workout](#workout) starts from.

- **Avoid**: DAO, data access object

### Runtime

The Effect runtime that each app builds once from its [Layers](#layer), and that runs every Effect program of that app. A test builds its own Runtime from the same Layers, with some [Services](#service) replaced. The JavaScript engine that runs the code, such as Node or Hermes, isn't a Runtime.

- **Avoid**: container, injector, executor

### Service

An Effect service: a set of operations that code asks for by its type, that its [Layer](#layer) builds, and that a test can replace. Each one is an [Application Service](#application-service), a [Repository](#repository) or an [Infrastructure Service](#infrastructure-service).

### Shell

The code that does every I/O, such as reading the database, calling the server or showing a notification, and asks the [Core](#core) for every decision: the [Services](#service), every other Effect program, and the code that runs them, such as tRPC procedures and React components.

- **Avoid**: I/O layer, effectful code, side-effect layer
- **Distinct from**: [Core](#core): the Core decides, and the Shell carries the decision out.

### Wire error

An error that a server [Application Service](#application-service) or [Repository](#repository) fails with, defined once for both apps, so the mobile app receives the same error the server raised, such as a [Routine](#routine) name that's already taken. A failure of signing in, such as too many attempts, isn't a Wire error.

- **Avoid**: domain error, API error, tRPC error

## Exercise library

### Equipment

An object that an [Exercise](#exercise) needs, such as a barbell, a bench or a rack. A [User](#user)'s own body weight isn't Equipment.

- **Avoid**: gear, apparatus, implement

### Exercise

A movement from the exercise library that Ankaa provides, the same for everyone, such as Bench Press (Barbell). The same movement with different [Equipment](#equipment) is a different Exercise, such as Bench Press (Dumbbell).

- **Avoid**: movement, lift, exercise variation

### Muscle group

A muscle or group of muscles that an [Exercise](#exercise) trains, such as the chest or the front deltoid. An Exercise trains each of its Muscle groups in one role: primary, when it mainly works them, or secondary, when they assist.

- **Avoid**: muscle, body part, target muscle

### Weight type

How the weight entered for an [Exercise](#exercise) is counted: the total lifted, the weight of one dumbbell or one side, the weight added to body weight, the weight taken off body weight as assistance, or no weight at all. Each Exercise has exactly one.

- **Avoid**: load type, weighting
- **Distinct from**: [Weight unit](#weight-unit): the Weight unit says what an entered weight is counted in, and the Weight type says what it counts.

## Routines and workouts

### Draft

The values a [User](#user) is editing on the device and hasn't [Saved](#save): a [Routine](#routine) open in the editor, or one [Set](#set), note or [Skip](#skip) of a [Workout exercise](#workout-exercise). A Draft exists from the moment editing starts, and only on the device.

- **Avoid**: unsaved changes, pending changes, local copy, form state

### Exercise group

One or more [Routine exercises](#routine-exercise) or [Workout exercises](#workout-exercise) that take one place in a [Section](#section) and are done together: a single exercise on its own, or a [Superset](#superset). Every exercise of a Section belongs to exactly one Exercise group, except a [Warm-up exercise](#warm-up-exercise), which goes with the exercise it prepares for.

- **Avoid**: group, block, station
- **Distinct from**: [Superset](#superset): a Superset is an Exercise group of two or more exercises, and an Exercise group can hold just one.

### Routine

A [User](#user)'s named, reusable plan for one [Workout](#workout): which [Exercises](#exercise) to do, in what order and how, and optionally the days of the week it's meant for.

- **Avoid**: plan, template, workout plan, session plan
- **Distinct from**: [Workout](#workout): a Workout records one time a User followed a Routine.

### Routine deletion

Removing a [Routine](#routine) at its [User](#user)'s request: it can't be [Saved](#save) or started again, and its name is free for another of their Routines. [Workouts](#workout) already started from it don't change.

### Routine exercise

One place an [Exercise](#exercise) takes in a [Routine](#routine), with its own note and planned [Sets](#set): in an [Exercise group](#exercise-group) of a [Section](#section), or as a [Warm-up exercise](#warm-up-exercise) of another Routine exercise. When a Routine uses the same Exercise twice, each use is a separate Routine exercise.

- **Avoid**: planned exercise, routine entry, slot
- **Distinct from**: [Exercise](#exercise): the Exercise is the movement in the library, and a Routine exercise is one use of it in one Routine.

### Save

To send a [Draft](#draft) to the server when the [User](#user) asks, so the server keeps it: a whole [Routine](#routine) from the editor, or one [Set](#set), note or [Skip](#skip) of a [Workout](#workout). Nothing is Saved unless the User asks.

- **Avoid**: sync, upload, persist, submit, autosave
- **Distinct from**: [Draft](#draft): a Draft is what the User is still editing on the device, and a Save sends it to the server.

### Section

One of the three parts, done in order, that every [Routine](#routine) and [Workout](#workout) splits its [Exercise groups](#exercise-group) into: warm-up, main and cool-down.

- **Avoid**: phase, stage

### Skip

A [User](#user)'s mark that a [Workout exercise](#workout-exercise) wasn't done as planned, with a reason (low on time, low energy, pain or other) and an optional note. The User can [Save](#save), change or clear it. It keeps the [Sets](#set) recorded for the Workout exercise, and the User clears it before recording more.

- **Avoid**: missed exercise, dropped exercise, abandoned exercise

### Superset

An [Exercise group](#exercise-group) of two or more [Routine exercises](#routine-exercise) or [Workout exercises](#workout-exercise), done by alternating them one [Set](#set) at a time, with [Rest](#rest) only after one Set of each.

- **Avoid**: tri-set, giant set, compound set, paired set, circuit

### Warm-up exercise

A [Routine exercise](#routine-exercise) or [Workout exercise](#workout-exercise) that uses a different [Exercise](#exercise) to prepare for one exercise of the main [Section](#section), done right before it. It belongs to the exercise it prepares for, outside any [Exercise group](#exercise-group).

- **Avoid**: specific warm-up, activation exercise, primer
- **Distinct from**: [Section](#section): an exercise in the warm-up Section prepares for the whole [Workout](#workout), not for one exercise.
- **Distinct from**: [Warm-up set](#warm-up-set): a Warm-up set is a lighter Set of the exercise itself.

### Workout

One time a [User](#user) trains, started from a [Routine](#routine) and recorded from the moment they start it until they stop it. A User has at most one Workout in progress at a time, and changing the Routine afterwards doesn't change a Workout already started.

- **Avoid**: training session, workout log, log
- **Distinct from**: [Routine](#routine): a Routine is the reusable plan, and each Workout records one time a User followed it.

### Workout exercise

One place an [Exercise](#exercise) takes in a [Workout](#workout), copied from a [Routine exercise](#routine-exercise) when the Workout starts, together with that Routine exercise's note and planned [Sets](#set). It adds its own note, its recorded Sets, and the [Weight unit](#weight-unit) they're entered in, and it keeps the [Weight type](#weight-type) and the [Amount unit](#amount) the Exercise had at that moment.

- **Avoid**: performed exercise, logged exercise, workout entry
- **Distinct from**: [Routine exercise](#routine-exercise): the Routine exercise is the plan, and the Workout exercise records what was done against its own copy of that plan.

## Sets

### Amount

How much of an [Exercise](#exercise) is done in one go: a number of [Repetitions](#repetition), or a number of seconds for an Exercise done for time, such as a plank. Each Exercise has one Amount unit, Repetitions or seconds, that all its Amounts are counted in.

- **Avoid**: reps, duration, count, target, volume, kind of amount

### Drop set

A [Set](#set) whose first [Segment](#segment) is followed right away, without [Rest](#rest), by more Segments at a lower weight, each one called a drop. A [Routine](#routine) plans how many Segments, the first included, and can plan the percentage of weight to take off at each drop.

- **Avoid**: strip set, descending set, running the rack

### Intensity technique

A way of pushing a [Set](#set) past where it would end, by splitting it into several [Segments](#segment): a [Drop set](#drop-set) or a [Rest-pause set](#rest-pause-set). A Set has at most one.

- **Avoid**: variation, set variation, technique, method
- **Distinct from**: [To failure](#to-failure): To failure says when a Set ends, with or without an Intensity technique.

### Matching planned Set

The planned [Set](#set) that a recorded Set of a [Workout exercise](#workout-exercise) is paired with: the one in the same position, or a plain [Working set](#working-set) when none was planned. It makes the recorded Set a [Warm-up set](#warm-up-set) or a Working set, and gives it its [To failure](#to-failure), [Tempo](#tempo) and [Intensity technique](#intensity-technique).

### Pause

A stop of a few seconds between two [Segments](#segment) of a [Rest-pause set](#rest-pause-set), planned in seconds by a [Routine](#routine) and counted down during a [Workout](#workout). A Pause belongs to its [Set](#set).

- **Avoid**: mini-rest, intra-set rest, breather, rest-pause period
- **Distinct from**: [Rest](#rest): Rest comes after a whole Set, and a Pause sits inside one.

### Pyramid

[Working sets](#working-set) of one exercise whose [Amount](#amount) falls from [Set](#set) to Set, such as 10, 8 and 6 [Repetitions](#repetition), or rises, such as 6, 8 and 10, which is a reverse Pyramid. A [Routine](#routine) plans one by giving each Set its own Amount.

- **Avoid**: pyramid set, ladder
- **Distinct from**: [Intensity technique](#intensity-technique): an Intensity technique changes one Set, and a Pyramid spans several.

### Repetition

One full cycle of a movement, such as lowering the bar to the chest and pressing it back up once.

- **Avoid**: rep

### Rest

The time after a [Set](#set) before the next one, planned in seconds for each planned Set, and counted down during a [Workout](#workout) once the [User](#user) starts it after that Set.

- **Avoid**: rest period, rest interval, break, recovery
- **Distinct from**: [Pause](#pause): a Pause sits inside a [Rest-pause set](#rest-pause-set), and Rest comes after a whole Set.

### Rest-pause set

A [Set](#set) split into a planned number of [Segments](#segment), the first included, by [Pauses](#pause), usually at the same weight.

- **Avoid**: cluster set, myo-reps

### Segment

One uninterrupted stretch of a [Set](#set), with its own [Amount](#amount) and weight. A Set has a single Segment, unless it's a [Drop set](#drop-set), where each drop starts a new Segment, or a [Rest-pause set](#rest-pause-set), where each [Pause](#pause) starts a new one.

- **Avoid**: mini-set, sub-set, cluster

### Set

One run of a single [Exercise](#exercise) done without a break, such as 8 [Repetitions](#repetition) of Bench Press (Barbell), apart from the moments between its [Segments](#segment). A planned Set is one that a [Routine](#routine) plans and that a [Workout](#workout) copies when it starts, and a recorded Set is one that a Workout records as the [User](#user) does it.

- **Avoid**: series, logged set, performed set

### Tempo

The seconds each [Repetition](#repetition) spends lowering, held at the bottom, lifting and held at the top, written as four numbers such as 3-0-1-2. An X in third place means lifting as fast as possible.

- **Avoid**: cadence, rhythm, speed

### To failure

Said of a [Set](#set) done until the [User](#user) can't go on: can't complete another [Repetition](#repetition) or, for an [Exercise](#exercise) done for time, can't hold any longer.

- **Avoid**: until failure, AMRAP, max effort

### Warm-up set

A lighter [Set](#set) done to prepare for the [Working sets](#working-set) of the same exercise, and left out of a [Workout](#workout)'s progress.

- **Avoid**: ramp-up set, feeder set, preparatory set
- **Distinct from**: [Section](#section): the warm-up Section holds whole exercises, and a Warm-up set is one Set of an exercise in any Section.

### Weight unit

What the weights of a [Workout exercise](#workout-exercise) are entered in: kilograms or pounds. Every [Set](#set) recorded for one Workout exercise uses its Weight unit.

- **Avoid**: unit, measurement system
- **Distinct from**: [Weight type](#weight-type): the Weight type says what an entered weight counts, and the Weight unit says what it's counted in.

### Working set

A [Set](#set) done for the training its exercise is there for, rather than to prepare for it. A [Workout](#workout) counts its progress in Working sets only.

- **Avoid**: work set, main set

## Deprecated

### Database query

One Drizzle query of a server [Feature](#feature), in its own file in the `queries/` folder of that Feature: a plain async function over the database or a transaction, with no business branching. Only the [Interactors](#interactor) of the same Feature call it.

- **Avoid**: data access object, DAO
- **Distinct from**: [Query procedure](#query-procedure): a tRPC procedure that the mobile app calls to read data.
- **Distinct from**: [Query options](#query-options): what TanStack Query uses on the mobile app to fetch and cache data.
- **Deprecated**: retired by [#86 Rebuild Ankaa on one Core and Shell architecture, with redesigned Routines, Workouts and Account deletion](https://github.com/manuelcattelan/ankaa/issues/86); replaced by [Repository](#repository).

### Interactor

One business operation, such as saving a Workout, written as a standalone `Effect.fn` in its own file in the `interactors/` folder of a [Feature](#feature). It yields the [Services](#service) it needs, reads, asks the [Core](#core) to decide, and then writes. Robert C. Martin's interactors must not depend on the database, but ours are [Shell](#shell) programs, which on the server read and write through [Database queries](#database-query).

- **Avoid**: use case
- **Distinct from**: [Service](#service): a Service wraps an implementation that can be swapped, and an Interactor uses Services to carry out one operation.
- **Deprecated**: retired by [#86 Rebuild Ankaa on one Core and Shell architecture, with redesigned Routines, Workouts and Account deletion](https://github.com/manuelcattelan/ankaa/issues/86); replaced by [Application Service](#application-service).

### Query procedure

A tRPC procedure, defined with `.query()`, that the mobile app calls to read data, as opposed to a mutation procedure, which changes data. Each server [Feature](#feature) defines its procedures in its `router.ts`.

- **Avoid**: query route, read procedure
- **Distinct from**: [Database query](#database-query): a server function that a Query procedure's [Interactor](#interactor) calls to read the database.
- **Distinct from**: [Query options](#query-options): what TanStack Query uses on the mobile app to fetch and cache data.
- **Deprecated**: retired by [#86 Rebuild Ankaa on one Core and Shell architecture, with redesigned Routines, Workouts and Account deletion](https://github.com/manuelcattelan/ankaa/issues/86).

### Skipped exercise

A [Workout exercise](#workout-exercise) the [User](#user) marked as not done as planned, with a reason: low on time, low energy, pain or other, and an optional note. It keeps any [Sets](#set) recorded before it was skipped.

- **Avoid**: missed exercise, dropped exercise, abandoned exercise
- **Deprecated**: retired by [#122 Bring the root glossary back in line with the code](https://github.com/manuelcattelan/ankaa/issues/122); replaced by [Skip](#skip).

### Store

To keep a [Workout](#workout) on the device, as its [Workout document](#workout-document), until its [Save](#save) succeeds, so no change is lost before the server has it.

- **Avoid**: save locally, keep offline
- **Distinct from**: [Save](#save): a Save sends the Workout to the server, and the device Stores it until that Save succeeds.
- **Deprecated**: retired by [#86 Rebuild Ankaa on one Core and Shell architecture, with redesigned Routines, Workouts and Account deletion](https://github.com/manuelcattelan/ankaa/issues/86).

### Workout document

A [Workout](#workout) as the device [Stores](#store) it: everything recorded so far, with a version number that every change increases and the version of its last successful [Save](#save), so the device knows which changes the server doesn't have yet.

- **Avoid**: local workout, workout draft, offline workout, cached workout
- **Distinct from**: [Workout](#workout): the Workout is what the person does, and the Workout document is the copy of it that the device keeps.
- **Deprecated**: retired by [#86 Rebuild Ankaa on one Core and Shell architecture, with redesigned Routines, Workouts and Account deletion](https://github.com/manuelcattelan/ankaa/issues/86).
