import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

/**
 * Builds a Routine of one Routine exercise of the Exercise with `exerciseId`,
 * alone in the main Section, whose ids all start with `idPrefix`, with
 * `sets` as its planned Sets, or one Working set when `sets` is left out.
 */
export function buildRoutineSaveInput({
  exerciseId,
  idPrefix,
  name,
  sets,
}: {
  exerciseId: string;
  idPrefix: string;
  name: string;
  sets?: RoutineSaveInput["sections"]["main"][number]["exercises"][number]["sets"];
}) {
  return {
    days: [],
    id: `${idPrefix}-0000-7000-8000-000000000001`,
    name,
    sections: {
      coolDown: [],
      main: [
        {
          exercises: [
            {
              exerciseId,
              id: `${idPrefix}-0000-7000-8000-000000000003`,
              note: null,
              pyramidLabel: null,
              sets: sets ?? [
                {
                  amount: 8,
                  id: `${idPrefix}-0000-7000-8000-000000000004`,
                  intensityTechnique: null,
                  isToFailure: false,
                  restSeconds: null,
                  tempo: null,
                  type: "working" as const,
                },
              ],
              warmUpExercises: [],
            },
          ],
          id: `${idPrefix}-0000-7000-8000-000000000002`,
        },
      ],
      warmUp: [],
    },
  };
}
