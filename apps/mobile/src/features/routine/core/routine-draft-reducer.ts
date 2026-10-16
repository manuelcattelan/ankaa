import type { DayOfWeek } from "@ankaa/core/features/routine/constants/day-of-week";
import type { Variation } from "@ankaa/core/shared/constants/intensity-technique";
import type { Section } from "@ankaa/core/shared/constants/section";
import type { SetType } from "@ankaa/core/shared/constants/set-type";

import { createRoutineDraftSections } from "@/features/routine/core/create-routine-draft-sections";
import { joinRoutineDraftBlockWithNextBlock } from "@/features/routine/core/join-routine-draft-block-with-next-block";
import { moveRoutineDraftBlock } from "@/features/routine/core/move-routine-draft-block";

export type RoutineDraft = {
  days: DayOfWeek[];
  id: string | undefined;
  name: string;
  sections: Record<Section, RoutineDraftBlock[]>;
};

export type RoutineDraftAction =
  | { days: DayOfWeek[]; type: "changedDays" }
  | {
      exerciseId: string;
      routineDraftBlockId: string;
      routineExerciseId: string;
      section: Section;
      type: "addedExercise";
    }
  | {
      exerciseId: string;
      routineExerciseId: string;
      type: "addedWarmUpExercise";
      warmUpForRoutineExerciseId: string;
    }
  | { id: string; type: "assignedId" }
  | { name: string; type: "changedName" }
  | {
      note: string;
      routineExerciseId: string;
      type: "changedExerciseNote";
    }
  | {
      routineDraftBlockId: string;
      routineDraftBlockMoveDirection: RoutineDraftBlockMoveDirection;
      section: Section;
      type: "movedBlock";
    }
  | {
      routineDraftBlockId: string;
      routineExerciseId: string;
      section: Section;
      type: "leftSuperset";
    }
  | {
      routineDraftBlockId: string;
      section: Section;
      type: "joinedSupersetWithNextBlock";
    }
  | {
      routineExerciseId: string;
      routineExerciseSet: RoutineDraftExerciseSet;
      type: "changedSet";
    }
  | {
      routineExerciseId: string;
      routineExerciseSetId: string;
      type: "addedSet" | "removedSet";
    }
  | { routineExerciseId: string; type: "removedExercise" };

export type RoutineDraftBlock = {
  exercises: RoutineDraftExercise[];
  id: string;
  warmUpExercises: RoutineDraftWarmUpExercise[];
};

export type RoutineDraftBlockMoveDirection = "down" | "up";

export type RoutineDraftExercise = {
  exerciseId: string;
  id: string;
  note: string;
  sets: RoutineDraftExerciseSet[];
};

export type RoutineDraftExerciseSet = {
  amount: string;
  dropSetSegmentCount: string;
  dropSetWeightPercentage: string;
  id: string;
  isToFailure: boolean;
  restPauseRestSeconds: string;
  restPauseSegmentCount: string;
  restSeconds: string;
  setType: SetType;
  tempo: string;
  variation: undefined | Variation;
};

export type RoutineDraftWarmUpExercise = RoutineDraftExercise & {
  warmUpForRoutineExerciseId: string;
};

type ChangeRoutineDraftExerciseOptions = {
  getRoutineDraftExerciseChanges: (
    routineDraftExercise: RoutineDraftExercise,
  ) => Partial<RoutineDraftExercise>;
  routineDraft: RoutineDraft;
  routineExerciseId: string;
};

type ChangeRoutineDraftSectionOptions = {
  getRoutineDraftBlocks: (
    routineDraftBlocks: RoutineDraftBlock[],
  ) => RoutineDraftBlock[];
  routineDraft: RoutineDraft;
  section: Section;
};

type ChangeRoutineDraftSectionsOptions = {
  getRoutineDraftBlocks: (
    routineDraftBlocks: RoutineDraftBlock[],
  ) => RoutineDraftBlock[];
  routineDraft: RoutineDraft;
};

export function routineDraftReducer(
  routineDraft: RoutineDraft,
  routineDraftAction: RoutineDraftAction,
) {
  switch (routineDraftAction.type) {
    case "addedExercise": {
      return changeRoutineDraftSection({
        getRoutineDraftBlocks: (routineDraftBlocks) => [
          ...routineDraftBlocks,
          {
            exercises: [
              {
                exerciseId: routineDraftAction.exerciseId,
                id: routineDraftAction.routineExerciseId,
                note: "",
                sets: [],
              },
            ],
            id: routineDraftAction.routineDraftBlockId,
            warmUpExercises: [],
          },
        ],
        routineDraft,
        section: routineDraftAction.section,
      });
    }

    case "addedSet": {
      return changeRoutineDraftExercise({
        getRoutineDraftExerciseChanges: (routineDraftExercise) => ({
          sets: [
            ...routineDraftExercise.sets,
            createEmptyRoutineDraftExerciseSet(
              routineDraftAction.routineExerciseSetId,
            ),
          ],
        }),
        routineDraft,
        routineExerciseId: routineDraftAction.routineExerciseId,
      });
    }

    case "addedWarmUpExercise": {
      return changeRoutineDraftSections({
        getRoutineDraftBlocks: (routineDraftBlocks) =>
          routineDraftBlocks.map((routineDraftBlock) =>
            routineDraftBlock.exercises.some(
              (routineDraftExercise) =>
                routineDraftExercise.id ===
                routineDraftAction.warmUpForRoutineExerciseId,
            )
              ? {
                  ...routineDraftBlock,
                  warmUpExercises: [
                    ...routineDraftBlock.warmUpExercises,
                    {
                      exerciseId: routineDraftAction.exerciseId,
                      id: routineDraftAction.routineExerciseId,
                      note: "",
                      sets: [],
                      warmUpForRoutineExerciseId:
                        routineDraftAction.warmUpForRoutineExerciseId,
                    },
                  ],
                }
              : routineDraftBlock,
          ),
        routineDraft,
      });
    }

    case "assignedId": {
      return { ...routineDraft, id: routineDraftAction.id };
    }

    case "changedDays": {
      return { ...routineDraft, days: routineDraftAction.days };
    }

    case "changedExerciseNote": {
      return changeRoutineDraftExercise({
        getRoutineDraftExerciseChanges: () => ({
          note: routineDraftAction.note,
        }),
        routineDraft,
        routineExerciseId: routineDraftAction.routineExerciseId,
      });
    }

    case "changedName": {
      return { ...routineDraft, name: routineDraftAction.name };
    }

    case "changedSet": {
      return changeRoutineDraftExercise({
        getRoutineDraftExerciseChanges: (routineDraftExercise) => ({
          sets: routineDraftExercise.sets.map((routineDraftExerciseSet) =>
            routineDraftExerciseSet.id ===
            routineDraftAction.routineExerciseSet.id
              ? routineDraftAction.routineExerciseSet
              : routineDraftExerciseSet,
          ),
        }),
        routineDraft,
        routineExerciseId: routineDraftAction.routineExerciseId,
      });
    }

    case "joinedSupersetWithNextBlock": {
      return changeRoutineDraftSection({
        getRoutineDraftBlocks: (routineDraftBlocks) =>
          joinRoutineDraftBlockWithNextBlock({
            routineDraftBlockId: routineDraftAction.routineDraftBlockId,
            routineDraftBlocks,
          }),
        routineDraft,
        section: routineDraftAction.section,
      });
    }

    case "leftSuperset": {
      return changeRoutineDraftSection({
        getRoutineDraftBlocks: (routineDraftBlocks) =>
          routineDraftBlocks.flatMap((routineDraftBlock) => {
            const leavingRoutineDraftExercise =
              routineDraftBlock.exercises.find(
                (routineDraftExercise) =>
                  routineDraftExercise.id ===
                  routineDraftAction.routineExerciseId,
              );

            if (!leavingRoutineDraftExercise) {
              return [routineDraftBlock];
            }

            return [
              {
                exercises: routineDraftBlock.exercises.filter(
                  (routineDraftExercise) =>
                    routineDraftExercise !== leavingRoutineDraftExercise,
                ),
                id: routineDraftBlock.id,
                warmUpExercises: routineDraftBlock.warmUpExercises.filter(
                  (routineDraftWarmUpExercise) =>
                    routineDraftWarmUpExercise.warmUpForRoutineExerciseId !==
                    leavingRoutineDraftExercise.id,
                ),
              },
              {
                exercises: [leavingRoutineDraftExercise],
                id: routineDraftAction.routineDraftBlockId,
                warmUpExercises: routineDraftBlock.warmUpExercises.filter(
                  (routineDraftWarmUpExercise) =>
                    routineDraftWarmUpExercise.warmUpForRoutineExerciseId ===
                    leavingRoutineDraftExercise.id,
                ),
              },
            ];
          }),
        routineDraft,
        section: routineDraftAction.section,
      });
    }

    case "movedBlock": {
      return changeRoutineDraftSection({
        getRoutineDraftBlocks: (routineDraftBlocks) =>
          moveRoutineDraftBlock({
            routineDraftBlockId: routineDraftAction.routineDraftBlockId,
            routineDraftBlockMoveDirection:
              routineDraftAction.routineDraftBlockMoveDirection,
            routineDraftBlocks,
          }),
        routineDraft,
        section: routineDraftAction.section,
      });
    }

    case "removedExercise": {
      return changeRoutineDraftSections({
        getRoutineDraftBlocks: (routineDraftBlocks) =>
          routineDraftBlocks
            .map((routineDraftBlock) => ({
              ...routineDraftBlock,
              exercises: routineDraftBlock.exercises.filter(
                (routineDraftExercise) =>
                  routineDraftExercise.id !==
                  routineDraftAction.routineExerciseId,
              ),
              warmUpExercises: routineDraftBlock.warmUpExercises.filter(
                (routineDraftWarmUpExercise) =>
                  routineDraftWarmUpExercise.id !==
                    routineDraftAction.routineExerciseId &&
                  routineDraftWarmUpExercise.warmUpForRoutineExerciseId !==
                    routineDraftAction.routineExerciseId,
              ),
            }))
            .filter(
              (routineDraftBlock) => routineDraftBlock.exercises.length > 0,
            ),
        routineDraft,
      });
    }

    case "removedSet": {
      return changeRoutineDraftExercise({
        getRoutineDraftExerciseChanges: (routineDraftExercise) => ({
          sets: routineDraftExercise.sets.filter(
            (routineDraftExerciseSet) =>
              routineDraftExerciseSet.id !==
              routineDraftAction.routineExerciseSetId,
          ),
        }),
        routineDraft,
        routineExerciseId: routineDraftAction.routineExerciseId,
      });
    }
  }
}

function changeRoutineDraftExercise({
  getRoutineDraftExerciseChanges,
  routineDraft,
  routineExerciseId,
}: ChangeRoutineDraftExerciseOptions) {
  return changeRoutineDraftSections({
    getRoutineDraftBlocks: (routineDraftBlocks) =>
      routineDraftBlocks.map((routineDraftBlock) => ({
        ...routineDraftBlock,
        exercises: routineDraftBlock.exercises.map((routineDraftExercise) =>
          routineDraftExercise.id === routineExerciseId
            ? {
                ...routineDraftExercise,
                ...getRoutineDraftExerciseChanges(routineDraftExercise),
              }
            : routineDraftExercise,
        ),
        warmUpExercises: routineDraftBlock.warmUpExercises.map(
          (routineDraftWarmUpExercise) =>
            routineDraftWarmUpExercise.id === routineExerciseId
              ? {
                  ...routineDraftWarmUpExercise,
                  ...getRoutineDraftExerciseChanges(routineDraftWarmUpExercise),
                }
              : routineDraftWarmUpExercise,
        ),
      })),
    routineDraft,
  });
}

function changeRoutineDraftSection({
  getRoutineDraftBlocks,
  routineDraft,
  section,
}: ChangeRoutineDraftSectionOptions) {
  return {
    ...routineDraft,
    sections: {
      ...routineDraft.sections,
      [section]: getRoutineDraftBlocks(routineDraft.sections[section]),
    },
  };
}

function changeRoutineDraftSections({
  getRoutineDraftBlocks,
  routineDraft,
}: ChangeRoutineDraftSectionsOptions) {
  return {
    ...routineDraft,
    sections: createRoutineDraftSections((section) =>
      getRoutineDraftBlocks(routineDraft.sections[section]),
    ),
  };
}

function createEmptyRoutineDraftExerciseSet(routineExerciseSetId: string) {
  const routineDraftExerciseSet: RoutineDraftExerciseSet = {
    amount: "",
    dropSetSegmentCount: "",
    dropSetWeightPercentage: "",
    id: routineExerciseSetId,
    isToFailure: false,
    restPauseRestSeconds: "",
    restPauseSegmentCount: "",
    restSeconds: "",
    setType: "working",
    tempo: "",
    variation: undefined,
  };

  return routineDraftExerciseSet;
}
