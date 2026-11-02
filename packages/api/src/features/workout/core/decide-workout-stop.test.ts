import { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { describe, expect, it } from "vitest";

import { decideWorkoutStop } from "#/features/workout/core/decide-workout-stop.ts";

const WORKOUT_STOP_INPUT = {
  id: "workout-1",
  note: null,
  reason: null,
};

const DONE_WORKOUT_EXERCISE = {
  id: "workout-exercise-1",
  plannedSets: [{ type: "working" as const }],
  recordedSetCount: 1,
  skipReason: null,
};

describe("decideWorkoutStop", () => {
  it("allows the stop of the User's Workout in progress", () => {
    expect(
      decideWorkoutStop({
        input: WORKOUT_STOP_INPUT,
        userId: "user-1",
        workout: {
          endedAt: null,
          userId: "user-1",
          workoutExercises: [DONE_WORKOUT_EXERCISE],
        },
      }),
    ).toStrictEqual({ _tag: "WorkoutStopAllowed", skips: [] });
  });

  it("Skips with the stop's reason and note each Workout exercise with no Skip and fewer recorded Working sets than planned, and leaves alone one with a Skip and one with every planned Working set recorded, whatever its Warm-up sets", () => {
    expect(
      decideWorkoutStop({
        input: {
          ...WORKOUT_STOP_INPUT,
          note: "Gym closing",
          reason: "low_on_time",
        },
        userId: "user-1",
        workout: {
          endedAt: null,
          userId: "user-1",
          workoutExercises: [
            {
              id: "workout-exercise-1",
              plannedSets: [{ type: "working" }],
              recordedSetCount: 0,
              skipReason: null,
            },
            {
              id: "workout-exercise-2",
              plannedSets: [
                { type: "warm_up" },
                { type: "working" },
                { type: "working" },
              ],
              recordedSetCount: 2,
              skipReason: null,
            },
            {
              id: "workout-exercise-3",
              plannedSets: [{ type: "working" }],
              recordedSetCount: 0,
              skipReason: "pain",
            },
            {
              id: "workout-exercise-4",
              plannedSets: [
                { type: "warm_up" },
                { type: "warm_up" },
                { type: "working" },
              ],
              recordedSetCount: 3,
              skipReason: null,
            },
          ],
        },
      }),
    ).toStrictEqual({
      _tag: "WorkoutStopAllowed",
      skips: [
        {
          note: "Gym closing",
          reason: "low_on_time",
          workoutExerciseId: "workout-exercise-1",
        },
        {
          note: "Gym closing",
          reason: "low_on_time",
          workoutExerciseId: "workout-exercise-2",
        },
      ],
    });
  });

  it("fails with SkipReasonMissingError for a stop with no reason while some Workout exercise isn't done", () => {
    expect(
      decideWorkoutStop({
        input: WORKOUT_STOP_INPUT,
        userId: "user-1",
        workout: {
          endedAt: null,
          userId: "user-1",
          workoutExercises: [
            DONE_WORKOUT_EXERCISE,
            {
              id: "workout-exercise-2",
              plannedSets: [{ type: "working" }],
              recordedSetCount: 0,
              skipReason: null,
            },
          ],
        },
      }),
    ).toStrictEqual(new SkipReasonMissingError());
  });

  it("decides that a Workout the User already stopped needs no stop", () => {
    expect(
      decideWorkoutStop({
        input: WORKOUT_STOP_INPUT,
        userId: "user-1",
        workout: {
          endedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
          workoutExercises: [DONE_WORKOUT_EXERCISE],
        },
      }),
    ).toStrictEqual({ _tag: "WorkoutAlreadyStopped" });
  });

  it("fails with WorkoutNotFoundError for a Workout that doesn't exist", () => {
    expect(
      decideWorkoutStop({
        input: WORKOUT_STOP_INPUT,
        userId: "user-1",
        workout: null,
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout of another User", () => {
    expect(
      decideWorkoutStop({
        input: WORKOUT_STOP_INPUT,
        userId: "user-1",
        workout: {
          endedAt: null,
          userId: "user-2",
          workoutExercises: [DONE_WORKOUT_EXERCISE],
        },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });
});
