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

To store a [Routine](#routine) or a [Workout](#workout) on the server. A person saves a Routine from the editor. A Workout saves itself after every change, and the device keeps the change until the server has stored it.

- **Avoid**: sync, upload, persist, submit

### Section

One of the three parts, done in order, that every [Routine](#routine) and [Workout](#workout) splits its exercises into: warm-up, main and cool-down.

- **Avoid**: phase, part, block, stage

### Skipped exercise

A [Workout exercise](#workout-exercise) the person marked as not done as planned, with a reason: low on time, low energy, pain or other, and an optional note. It keeps any [Sets](#set) recorded before it was skipped.

- **Avoid**: missed exercise, dropped exercise, abandoned exercise

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
