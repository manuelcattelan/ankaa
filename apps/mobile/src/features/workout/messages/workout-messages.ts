import type { AmountUnit } from "@ankaa/core/shared/constants/amount";

import { formatCount } from "#/shared/core/format-count.ts";

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const WORKOUT_MESSAGES = {
  dropSetLabel: ({
    segmentCount,
    weightPercentage,
  }: {
    segmentCount: number;
    weightPercentage: null | number;
  }) =>
    weightPercentage === null
      ? `Drop set: ${String(segmentCount)} segments`
      : `Drop set: ${String(segmentCount)} segments, dropping ${String(weightPercentage)}% of the weight each time`,
  plannedAmountLabels: {
    repetition: (amount: number) =>
      formatCount({
        count: amount,
        plural: "repetitions",
        singular: "repetition",
      }),
    second: (amount: number) => formatCount({ count: amount, ...SECONDS_UNIT }),
  } satisfies Record<AmountUnit, (amount: number) => string>,
  plannedNoteLabel: (plannedNote: string) => `Routine note: ${plannedNote}`,
  restLabel: (restSeconds: number) =>
    `Rest: ${formatCount({ count: restSeconds, ...SECONDS_UNIT })}`,
  restPauseSetLabel: ({
    pauseSeconds,
    segmentCount,
  }: {
    pauseSeconds: number;
    segmentCount: number;
  }) =>
    `Rest-pause set: ${String(segmentCount)} segments, with pauses of ${formatCount({ count: pauseSeconds, ...SECONDS_UNIT })}`,
  resumeWorkoutButton: "Resume workout",
  routineNotFoundError:
    "This routine doesn't exist anymore: start another routine.",
  startWorkoutButton: (routineName: string) => `Start ${routineName}`,
  stopWorkoutButton: "Stop workout",
  tempoDescription:
    "The seconds for lowering, holding at the bottom, lifting and holding at the top. X means lifting as fast as you can.",
  tempoLabel: (tempo: string) => `Tempo ${tempo}`,
  toFailureLabel: "To failure",
  warmUpSetLabel: (setNumber: number) => `Set ${String(setNumber)}, warm-up`,
  workoutInProgressConflictError:
    "You already have a workout in progress: resume it, or stop it before you start another.",
  workoutNotFoundError:
    "This workout isn't in progress anymore: go back to the home screen.",
  workoutNotInProgressStatus: "You have no workout in progress.",
  workoutScreenTitle: "Workout",
};
