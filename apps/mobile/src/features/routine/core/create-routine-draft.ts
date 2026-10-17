import type { Section } from "@ankaa/core/shared/constants/section";

import type {
  RoutineDraft,
  RoutineDraftBlock,
  RoutineDraftExercise,
} from "@/features/routine/core/routine-draft-reducer";
import type { Routine } from "@/shared/interactors/list-routines";

import { createRoutineDraftSections } from "@/features/routine/core/create-routine-draft-sections";

type CreateRoutineDraftBlocksOptions = {
  routine: Routine;
  section: Section;
};

export function createRoutineDraft(routine: Routine | undefined) {
  const routineDraft: RoutineDraft = routine
    ? {
        days: routine.days,
        id: routine.id,
        name: routine.name,
        sections: createRoutineDraftSections((section) =>
          createRoutineDraftBlocks({ routine, section }),
        ),
      }
    : {
        days: [],
        id: undefined,
        name: "",
        sections: createRoutineDraftSections(() => []),
      };

  return routineDraft;
}

function createRoutineDraftBlocks({
  routine,
  section,
}: CreateRoutineDraftBlocksOptions) {
  const routineDraftBlocks: RoutineDraftBlock[] = [];

  let lastRoutineDraftBlock: RoutineDraftBlock | undefined;
  let lastSuperset: number | undefined;

  for (const routineExercise of routine.exercises) {
    if (
      routineExercise.section !== section ||
      typeof routineExercise.warmUpForRoutineExerciseId === "string"
    ) {
      continue;
    }

    const routineDraftExercise = createRoutineDraftExercise(routineExercise);

    if (
      lastRoutineDraftBlock &&
      typeof routineExercise.superset === "number" &&
      routineExercise.superset === lastSuperset
    ) {
      lastRoutineDraftBlock.exercises.push(routineDraftExercise);
    } else {
      lastRoutineDraftBlock = {
        exercises: [routineDraftExercise],
        id: routineDraftExercise.id,
        warmUpExercises: [],
      };

      routineDraftBlocks.push(lastRoutineDraftBlock);
    }

    lastSuperset = routineExercise.superset ?? undefined;
  }

  for (const routineExercise of routine.exercises) {
    const warmUpForRoutineDraftBlock = routineDraftBlocks.find(
      (routineDraftBlock) =>
        routineDraftBlock.exercises.some(
          (routineDraftExercise) =>
            routineDraftExercise.id ===
            routineExercise.warmUpForRoutineExerciseId,
        ),
    );

    if (
      warmUpForRoutineDraftBlock &&
      typeof routineExercise.warmUpForRoutineExerciseId === "string"
    ) {
      warmUpForRoutineDraftBlock.warmUpExercises.push({
        ...createRoutineDraftExercise(routineExercise),
        warmUpForRoutineExerciseId: routineExercise.warmUpForRoutineExerciseId,
      });
    }
  }

  return routineDraftBlocks;
}

function createRoutineDraftExercise(
  routineExercise: Routine["exercises"][number],
) {
  const routineDraftExercise: RoutineDraftExercise = {
    exerciseId: routineExercise.exerciseId,
    id: routineExercise.id,
    note: routineExercise.note ?? "",
    sets: routineExercise.sets.map((routineExerciseSet) => ({
      amount: routineExerciseSet.amount?.toString() ?? "",
      dropSetSegmentCount:
        routineExerciseSet.dropSetSegmentCount?.toString() ?? "",
      dropSetWeightPercentage:
        routineExerciseSet.dropSetWeightPercentage?.toString() ?? "",
      id: routineExerciseSet.id,
      isToFailure: routineExerciseSet.isToFailure,
      restPauseRestSeconds:
        routineExerciseSet.restPauseRestSeconds?.toString() ?? "",
      restPauseSegmentCount:
        routineExerciseSet.restPauseSegmentCount?.toString() ?? "",
      restSeconds: routineExerciseSet.restSeconds?.toString() ?? "",
      setType: routineExerciseSet.setType,
      tempo: routineExerciseSet.tempo ?? "",
      variation: routineExerciseSet.variation ?? undefined,
    })),
  };

  return routineDraftExercise;
}
