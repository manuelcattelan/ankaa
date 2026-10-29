import type { DayOfWeek } from "@ankaa/core/features/routine/constants/days-of-week";
import type { Section } from "@ankaa/core/shared/constants/sections";

import type { RoutineExerciseSetDraft } from "#/features/routine/core/routine-exercise-set-form-schema.ts";
import type { RoutineDraft } from "#/features/routine/core/routine-form-schema.ts";

export type ExerciseGroupDraft = RoutineDraft["sections"]["warmUp"][number];

export type ExerciseGroupMoveDirection = "down" | "up";

export type MainExerciseGroupDraft = RoutineDraft["sections"]["main"][number];

export type MainRoutineExerciseDraft =
  MainExerciseGroupDraft["exercises"][number];

export type RoutineDraftAction =
  | { days: readonly DayOfWeek[]; type: "changedDays" }
  | {
      exerciseGroupId: string;
      exerciseGroupMoveDirection: ExerciseGroupMoveDirection;
      section: Section;
      type: "movedExerciseGroup";
    }
  | {
      exerciseGroupId: string;
      exerciseId: string;
      routineExerciseId: string;
      section: Section;
      type: "addedExercise";
    }
  | {
      exerciseGroupId: string;
      routineExerciseId: string;
      section: Section;
      type: "leftSuperset";
    }
  | {
      exerciseGroupId: string;
      section: Section;
      type: "joinedNextExerciseGroup";
    }
  | {
      exerciseId: string;
      routineExerciseId: string;
      type: "addedWarmUpExercise";
      warmUpForRoutineExerciseId: string;
    }
  | { id: string; type: "assignedId" }
  | { name: string; type: "changedName" }
  | { note: string; routineExerciseId: string; type: "changedExerciseNote" }
  | {
      routineExerciseId: string;
      set: RoutineExerciseSetDraft;
      type: "changedSet";
    }
  | {
      routineExerciseId: string;
      setId: string;
      type: "addedSet" | "removedSet";
    }
  | { routineExerciseId: string; type: "removedExercise" };

export type RoutineExerciseDraft = ExerciseGroupDraft["exercises"][number];

type ExerciseGroupDraftOf<TRoutineExerciseDraft extends RoutineExerciseDraft> =
  {
    readonly exercises: readonly TRoutineExerciseDraft[];
    readonly id: string;
  };

/**
 * Applies one change that the User makes in the editor to the Draft of a
 * Routine, keeping it a tree of Sections, Exercise groups and Routine
 * exercises with Warm-up exercises under the main Section's ones.
 */
export function routineDraftReducer(
  routineDraft: RoutineDraft,
  action: RoutineDraftAction,
) {
  switch (action.type) {
    case "addedExercise": {
      const routineExerciseDraft = {
        exerciseId: action.exerciseId,
        id: action.routineExerciseId,
        note: "",
        sets: [],
      };
      const exerciseGroupDraft = {
        exercises: [routineExerciseDraft],
        id: action.exerciseGroupId,
      };

      return changeSections({
        routineDraft,
        sections: {
          coolDown:
            action.section === "cool_down"
              ? [...routineDraft.sections.coolDown, exerciseGroupDraft]
              : routineDraft.sections.coolDown,
          main:
            action.section === "main"
              ? [
                  ...routineDraft.sections.main,
                  {
                    exercises: [
                      { ...routineExerciseDraft, warmUpExercises: [] },
                    ],
                    id: action.exerciseGroupId,
                  },
                ]
              : routineDraft.sections.main,
          warmUp:
            action.section === "warm_up"
              ? [...routineDraft.sections.warmUp, exerciseGroupDraft]
              : routineDraft.sections.warmUp,
        },
      });
    }

    case "addedSet": {
      return changeRoutineExercise({
        changeRoutineExercise: (routineExerciseDraft) => ({
          sets: [
            ...routineExerciseDraft.sets,
            {
              amount: "",
              id: action.setId,
              intensityTechnique: null,
              isToFailure: false,
              restSeconds: "",
              tempo: "",
              type: "working",
            },
          ],
        }),
        routineDraft,
        routineExerciseId: action.routineExerciseId,
      });
    }

    case "addedWarmUpExercise": {
      return changeMainRoutineExercises({
        changeMainRoutineExercise: (mainRoutineExerciseDraft) =>
          mainRoutineExerciseDraft.id === action.warmUpForRoutineExerciseId
            ? {
                ...mainRoutineExerciseDraft,
                warmUpExercises: [
                  ...mainRoutineExerciseDraft.warmUpExercises,
                  {
                    exerciseId: action.exerciseId,
                    id: action.routineExerciseId,
                    note: "",
                    sets: [],
                  },
                ],
              }
            : mainRoutineExerciseDraft,
        routineDraft,
      });
    }

    case "assignedId": {
      return { ...routineDraft, id: action.id };
    }

    case "changedDays": {
      return { ...routineDraft, days: action.days };
    }

    case "changedExerciseNote": {
      return changeRoutineExercise({
        changeRoutineExercise: () => ({ note: action.note }),
        routineDraft,
        routineExerciseId: action.routineExerciseId,
      });
    }

    case "changedName": {
      return { ...routineDraft, name: action.name };
    }

    case "changedSet": {
      return changeRoutineExercise({
        changeRoutineExercise: (routineExerciseDraft) => ({
          sets: routineExerciseDraft.sets.map((set) =>
            set.id === action.set.id ? action.set : set,
          ),
        }),
        routineDraft,
        routineExerciseId: action.routineExerciseId,
      });
    }

    case "joinedNextExerciseGroup": {
      return changeSectionExerciseGroups({
        changeExerciseGroups: (exerciseGroups) =>
          joinNextExerciseGroup({
            exerciseGroupId: action.exerciseGroupId,
            exerciseGroups,
          }),
        routineDraft,
        section: action.section,
      });
    }

    case "leftSuperset": {
      return changeSectionExerciseGroups({
        changeExerciseGroups: (exerciseGroups) =>
          exerciseGroups.flatMap((exerciseGroup) => {
            const leavingRoutineExercise = exerciseGroup.exercises.find(
              (routineExerciseDraft) =>
                routineExerciseDraft.id === action.routineExerciseId,
            );

            return leavingRoutineExercise === undefined
              ? [exerciseGroup]
              : [
                  {
                    ...exerciseGroup,
                    exercises: exerciseGroup.exercises.filter(
                      (routineExerciseDraft) =>
                        routineExerciseDraft !== leavingRoutineExercise,
                    ),
                  },
                  {
                    exercises: [leavingRoutineExercise],
                    id: action.exerciseGroupId,
                  },
                ];
          }),
        routineDraft,
        section: action.section,
      });
    }

    case "movedExerciseGroup": {
      return changeSectionExerciseGroups({
        changeExerciseGroups: (exerciseGroups) =>
          moveExerciseGroup({
            exerciseGroupId: action.exerciseGroupId,
            exerciseGroupMoveDirection: action.exerciseGroupMoveDirection,
            exerciseGroups,
          }),
        routineDraft,
        section: action.section,
      });
    }

    case "removedExercise": {
      const removedRoutineExerciseId = action.routineExerciseId;

      function isKept(routineExerciseDraft: RoutineExerciseDraft) {
        return routineExerciseDraft.id !== removedRoutineExerciseId;
      }

      return changeSections({
        routineDraft,
        sections: {
          coolDown: removeRoutineExercise({
            exerciseGroups: routineDraft.sections.coolDown,
            isKept,
          }),
          main: removeRoutineExercise({
            exerciseGroups: routineDraft.sections.main.map((exerciseGroup) => ({
              ...exerciseGroup,
              exercises: exerciseGroup.exercises.map(
                (mainRoutineExerciseDraft) => ({
                  ...mainRoutineExerciseDraft,
                  warmUpExercises:
                    mainRoutineExerciseDraft.warmUpExercises.filter(isKept),
                }),
              ),
            })),
            isKept,
          }),
          warmUp: removeRoutineExercise({
            exerciseGroups: routineDraft.sections.warmUp,
            isKept,
          }),
        },
      });
    }

    case "removedSet": {
      return changeRoutineExercise({
        changeRoutineExercise: (routineExerciseDraft) => ({
          sets: routineExerciseDraft.sets.filter(
            (set) => set.id !== action.setId,
          ),
        }),
        routineDraft,
        routineExerciseId: action.routineExerciseId,
      });
    }
  }
}

function changeMainRoutineExercises({
  changeMainRoutineExercise,
  routineDraft,
}: {
  changeMainRoutineExercise: (
    mainRoutineExerciseDraft: MainRoutineExerciseDraft,
  ) => MainRoutineExerciseDraft;
  routineDraft: RoutineDraft;
}) {
  return changeSections({
    routineDraft,
    sections: {
      main: routineDraft.sections.main.map((exerciseGroup) => ({
        ...exerciseGroup,
        exercises: exerciseGroup.exercises.map(changeMainRoutineExercise),
      })),
    },
  });
}

/**
 * Changes the Routine exercise with `routineExerciseId`, wherever it sits in
 * the tree, Warm-up exercises included.
 */
function changeRoutineExercise({
  changeRoutineExercise: getRoutineExerciseChanges,
  routineDraft,
  routineExerciseId,
}: {
  changeRoutineExercise: (
    routineExerciseDraft: RoutineExerciseDraft,
  ) => Partial<RoutineExerciseDraft>;
  routineDraft: RoutineDraft;
  routineExerciseId: string;
}) {
  function changeMatchingRoutineExercise<
    TRoutineExerciseDraft extends RoutineExerciseDraft,
  >(routineExerciseDraft: TRoutineExerciseDraft) {
    return routineExerciseDraft.id === routineExerciseId
      ? {
          ...routineExerciseDraft,
          ...getRoutineExerciseChanges(routineExerciseDraft),
        }
      : routineExerciseDraft;
  }

  function changeExerciseGroups(exerciseGroups: readonly ExerciseGroupDraft[]) {
    return exerciseGroups.map((exerciseGroup) => ({
      ...exerciseGroup,
      exercises: exerciseGroup.exercises.map(changeMatchingRoutineExercise),
    }));
  }

  return changeSections({
    routineDraft,
    sections: {
      coolDown: changeExerciseGroups(routineDraft.sections.coolDown),
      main: routineDraft.sections.main.map((exerciseGroup) => ({
        ...exerciseGroup,
        exercises: exerciseGroup.exercises.map((mainRoutineExerciseDraft) => ({
          ...changeMatchingRoutineExercise(mainRoutineExerciseDraft),
          warmUpExercises: mainRoutineExerciseDraft.warmUpExercises.map(
            changeMatchingRoutineExercise,
          ),
        })),
      })),
      warmUp: changeExerciseGroups(routineDraft.sections.warmUp),
    },
  });
}

function changeSectionExerciseGroups({
  changeExerciseGroups,
  routineDraft,
  section,
}: {
  changeExerciseGroups: <TRoutineExerciseDraft extends RoutineExerciseDraft>(
    exerciseGroups: readonly ExerciseGroupDraftOf<TRoutineExerciseDraft>[],
  ) => ExerciseGroupDraftOf<TRoutineExerciseDraft>[];
  routineDraft: RoutineDraft;
  section: Section;
}) {
  return changeSections({
    routineDraft,
    sections: {
      coolDown:
        section === "cool_down"
          ? changeExerciseGroups(routineDraft.sections.coolDown)
          : routineDraft.sections.coolDown,
      main:
        section === "main"
          ? changeExerciseGroups(routineDraft.sections.main)
          : routineDraft.sections.main,
      warmUp:
        section === "warm_up"
          ? changeExerciseGroups(routineDraft.sections.warmUp)
          : routineDraft.sections.warmUp,
    },
  });
}

function changeSections({
  routineDraft,
  sections,
}: {
  routineDraft: RoutineDraft;
  sections: Partial<RoutineDraft["sections"]>;
}) {
  return {
    ...routineDraft,
    sections: { ...routineDraft.sections, ...sections },
  };
}

function joinNextExerciseGroup<
  TRoutineExerciseDraft extends RoutineExerciseDraft,
>({
  exerciseGroupId,
  exerciseGroups,
}: {
  exerciseGroupId: string;
  exerciseGroups: readonly ExerciseGroupDraftOf<TRoutineExerciseDraft>[];
}) {
  const exerciseGroupIndex = exerciseGroups.findIndex(
    (exerciseGroup) => exerciseGroup.id === exerciseGroupId,
  );
  const exerciseGroup = exerciseGroups[exerciseGroupIndex];
  const nextExerciseGroup = exerciseGroups[exerciseGroupIndex + 1];

  if (exerciseGroup === undefined || nextExerciseGroup === undefined) {
    return [...exerciseGroups];
  }

  return exerciseGroups.flatMap((otherExerciseGroup) => {
    if (otherExerciseGroup === nextExerciseGroup) {
      return [];
    }

    return otherExerciseGroup === exerciseGroup
      ? [
          {
            ...exerciseGroup,
            exercises: [
              ...exerciseGroup.exercises,
              ...nextExerciseGroup.exercises,
            ],
          },
        ]
      : [otherExerciseGroup];
  });
}

function moveExerciseGroup<TRoutineExerciseDraft extends RoutineExerciseDraft>({
  exerciseGroupId,
  exerciseGroupMoveDirection,
  exerciseGroups,
}: {
  exerciseGroupId: string;
  exerciseGroupMoveDirection: ExerciseGroupMoveDirection;
  exerciseGroups: readonly ExerciseGroupDraftOf<TRoutineExerciseDraft>[];
}) {
  const exerciseGroupIndex = exerciseGroups.findIndex(
    (exerciseGroup) => exerciseGroup.id === exerciseGroupId,
  );
  const neighborExerciseGroupIndex =
    exerciseGroupMoveDirection === "up"
      ? exerciseGroupIndex - 1
      : exerciseGroupIndex + 1;
  const exerciseGroup = exerciseGroups[exerciseGroupIndex];
  const neighborExerciseGroup = exerciseGroups[neighborExerciseGroupIndex];

  if (exerciseGroup === undefined || neighborExerciseGroup === undefined) {
    return [...exerciseGroups];
  }

  return exerciseGroups
    .with(exerciseGroupIndex, neighborExerciseGroup)
    .with(neighborExerciseGroupIndex, exerciseGroup);
}

function removeRoutineExercise<
  TRoutineExerciseDraft extends RoutineExerciseDraft,
>({
  exerciseGroups,
  isKept,
}: {
  exerciseGroups: readonly ExerciseGroupDraftOf<TRoutineExerciseDraft>[];
  isKept: (routineExerciseDraft: RoutineExerciseDraft) => boolean;
}) {
  return exerciseGroups
    .map((exerciseGroup) => ({
      ...exerciseGroup,
      exercises: exerciseGroup.exercises.filter(isKept),
    }))
    .filter((exerciseGroup) => exerciseGroup.exercises.length > 0);
}
