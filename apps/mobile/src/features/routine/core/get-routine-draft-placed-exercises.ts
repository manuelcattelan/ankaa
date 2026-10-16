import type { Section } from "@ankaa/core/shared/constants/section";

import { SECTIONS } from "@ankaa/core/shared/constants/section";

import type {
  RoutineDraft,
  RoutineDraftExercise,
} from "@/features/routine/core/routine-draft-reducer";

import { WARM_UP_SECTION } from "@/features/routine/constants/section";
import { SUPERSET_EXERCISE_COUNT_MINIMUM } from "@/features/routine/constants/superset";

type RoutineDraftPlacedExercise = {
  routineDraftExercise: RoutineDraftExercise;
  section: Section;
  superset: number | undefined;
  warmUpForRoutineExerciseId: string | undefined;
};

export function getRoutineDraftPlacedExercises(routineDraft: RoutineDraft) {
  const routineDraftSectionBlocks = SECTIONS.flatMap((section) =>
    routineDraft.sections[section].map((routineDraftBlock) => ({
      routineDraftBlock,
      section,
    })),
  );

  return routineDraftSectionBlocks.flatMap(
    (routineDraftSectionBlock, supersetNumber) => [
      ...routineDraftSectionBlock.routineDraftBlock.warmUpExercises.map(
        (routineDraftWarmUpExercise) =>
          ({
            routineDraftExercise: routineDraftWarmUpExercise,
            section: WARM_UP_SECTION,
            superset: undefined,
            warmUpForRoutineExerciseId:
              routineDraftWarmUpExercise.warmUpForRoutineExerciseId,
          }) satisfies RoutineDraftPlacedExercise,
      ),
      ...routineDraftSectionBlock.routineDraftBlock.exercises.map(
        (routineDraftExercise) =>
          ({
            routineDraftExercise,
            section: routineDraftSectionBlock.section,
            superset:
              routineDraftSectionBlock.routineDraftBlock.exercises.length >=
              SUPERSET_EXERCISE_COUNT_MINIMUM
                ? supersetNumber
                : undefined,
            warmUpForRoutineExerciseId: undefined,
          }) satisfies RoutineDraftPlacedExercise,
      ),
    ],
  );
}
