import type { AppRouter } from "@ankaa/api";
import type { PickerItemValue, SnapPoint } from "@expo/ui";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import {
  AMOUNT_MINIMUM,
  DAYS_OF_WEEK,
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
  REST_SECONDS_MINIMUM,
  SECTIONS,
  SEGMENT_COUNT_MINIMUM,
  SET_TYPES,
  TEMPO_PATTERN,
  VARIATIONS,
} from "@ankaa/database/constants";
import { BottomSheet, Host, Picker, RNHostView, Switch } from "@expo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ExpoCrypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useReducer, useState } from "react";
import { v7 } from "uuid";

import type { Exercise } from "@/components/exercise-picker";

import { useTrpc } from "@/clients/trpc";
import { Button } from "@/components/button";
import { CheckboxGroup } from "@/components/checkbox-group";
import { ExercisePicker } from "@/components/exercise-picker";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { announceMessage } from "@/utilities/accessibility";
import { getTrpcErrorMessage } from "@/utilities/errors";
import { messages } from "@/utilities/messages";

type BuildRoutineExerciseSetSaveInputOptions = {
  position: number;
  routineDraftExerciseSet: RoutineDraftExerciseSet;
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

type CreateRoutineDraftBlocksOptions = {
  routine: Routine;
  section: Section;
};

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

type ExercisePickerTarget =
  { section: Section } | { warmUpForRoutineExerciseId: string };

type GetWholeNumberValidationErrorOptions = {
  isRequired: boolean;
  maximum?: number;
  minimum: number;
  wholeNumberText: string;
};

type JoinRoutineDraftBlockWithNextBlockOptions = {
  routineDraftBlockId: string;
  routineDraftBlocks: RoutineDraftBlock[];
};

type MoveRoutineDraftBlockOptions = {
  routineDraftBlockId: string;
  routineDraftBlockMoveDirection: RoutineDraftBlockMoveDirection;
  routineDraftBlocks: RoutineDraftBlock[];
};

type Routine = inferRouterOutputs<AppRouter>["routine"]["list"][number];

type RoutineDraft = {
  days: DayOfWeek[];
  id: string;
  name: string;
  sections: Record<Section, RoutineDraftBlock[]>;
};

type RoutineDraftAction =
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

type RoutineDraftBlock = {
  exercises: RoutineDraftExercise[];
  id: string;
  warmUpExercises: RoutineDraftWarmUpExercise[];
};

type RoutineDraftBlockMoveDirection = "down" | "up";

type RoutineDraftExercise = {
  exerciseId: string;
  id: string;
  note: string;
  sets: RoutineDraftExerciseSet[];
};

type RoutineDraftExerciseSet = {
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

type RoutineDraftPlacedExercise = {
  routineDraftExercise: RoutineDraftExercise;
  section: Section;
  superset: number | undefined;
  warmUpForRoutineExerciseId: string | undefined;
};

type RoutineDraftWarmUpExercise = RoutineDraftExercise & {
  warmUpForRoutineExerciseId: string;
};

type RoutineEditorBlockProperties = RoutineEditorSharedProperties & {
  isFirstRoutineDraftBlock: boolean;
  isLastRoutineDraftBlock: boolean;
  routineDraftBlock: RoutineDraftBlock;
  section: Section;
};

type RoutineEditorExerciseProperties = RoutineEditorSharedProperties & {
  onAddWarmUpExercise?: () => void;
  onLeaveSuperset?: () => void;
  routineDraftExercise: RoutineDraftExercise;
  warmUpForExerciseName?: string;
};

type RoutineEditorPickerProperties<TPickerValue extends PickerItemValue> = {
  label: string;
  onChangeSelectedValue: (selectedValue: TPickerValue) => void;
  optionLabels: Record<TPickerValue, string>;
  options: readonly TPickerValue[];
  selectedValue: TPickerValue;
};

type RoutineEditorProperties = {
  routine?: Routine;
};

type RoutineEditorSectionProperties = RoutineEditorSharedProperties & {
  routineDraftBlocks: RoutineDraftBlock[];
  section: Section;
};

type RoutineEditorSetProperties = {
  dispatchRoutineDraftAction: (routineDraftAction: RoutineDraftAction) => void;
  routineDraftExerciseSet: RoutineDraftExerciseSet;
  routineExerciseId: string;
  setNumber: number;
  shouldShowValidationErrors: boolean;
};

type RoutineEditorSharedProperties = {
  dispatchRoutineDraftAction: (routineDraftAction: RoutineDraftAction) => void;
  exerciseNames: Map<string, string>;
  onOpenExercisePicker: (exercisePickerTarget: ExercisePickerTarget) => void;
  shouldShowValidationErrors: boolean;
};

type RoutineExerciseSetSaveInput =
  RoutineSaveInput["exercises"][number]["sets"][number];

type RoutineSaveInput = inferRouterInputs<AppRouter>["routine"]["save"];

type Section = (typeof SECTIONS)[number];

type SetType = (typeof SET_TYPES)[number];

type Variation = (typeof VARIATIONS)[number];

type VariationPickerValue = typeof NO_VARIATION_PICKER_VALUE | Variation;

const NO_VARIATION_PICKER_VALUE = "none";

const MAIN_SECTION = "main";
const WARM_UP_SECTION = "warm_up";

const SUPERSET_EXERCISE_COUNT_MINIMUM = 2;

const UUID_RANDOM_BYTE_COUNT = 16;

const WHOLE_NUMBER_PATTERN = /^\d+$/;

const EXERCISE_PICKER_SNAP_POINTS: SnapPoint[] = ["full"];

const DAY_OF_WEEK_LABELS = {
  friday: messages.routineEditor.fridayDayLabel,
  monday: messages.routineEditor.mondayDayLabel,
  saturday: messages.routineEditor.saturdayDayLabel,
  sunday: messages.routineEditor.sundayDayLabel,
  thursday: messages.routineEditor.thursdayDayLabel,
  tuesday: messages.routineEditor.tuesdayDayLabel,
  wednesday: messages.routineEditor.wednesdayDayLabel,
} satisfies Record<DayOfWeek, string>;

const SECTION_LABELS = {
  cool_down: messages.routineEditor.coolDownSectionLabel,
  main: messages.routineEditor.mainSectionLabel,
  warm_up: messages.routineEditor.warmUpSectionLabel,
} satisfies Record<Section, string>;

const SET_TYPE_LABELS = {
  warm_up: messages.routineEditor.warmUpSetTypeLabel,
  working: messages.routineEditor.workingSetTypeLabel,
} satisfies Record<SetType, string>;

const VARIATION_PICKER_LABELS = {
  drop_set: messages.routineEditor.dropSetVariationLabel,
  none: messages.routineEditor.noVariationLabel,
  rest_pause: messages.routineEditor.restPauseVariationLabel,
} satisfies Record<VariationPickerValue, string>;

const VARIATION_PICKER_OPTIONS: VariationPickerValue[] = [
  NO_VARIATION_PICKER_VALUE,
  ...VARIATIONS,
];

export function RoutineEditor({ routine }: RoutineEditorProperties) {
  const trpc = useTrpc();

  const router = useRouter();

  const queryClient = useQueryClient();

  const [routineDraft, dispatchRoutineDraftAction] = useReducer(
    routineDraftReducer,
    routine,
    createRoutineDraft,
  );

  const [exercisePickerTarget, setExercisePickerTarget] =
    useState<ExercisePickerTarget>();
  const [shouldShowValidationErrors, setShouldShowValidationErrors] =
    useState(false);

  const exerciseLibrary = useQuery(trpc.exercise.list.queryOptions());

  const saveRoutine = useMutation(
    trpc.routine.save.mutationOptions({
      onError: (error) => {
        announceMessage(getRoutineSaveErrorMessage(error));
      },
      onSuccess: showUpdatedRoutineList,
    }),
  );

  const deleteRoutine = useMutation(
    trpc.routine.delete.mutationOptions({
      onError: (error) => {
        announceMessage(getTrpcErrorMessage(error));
      },
      onSuccess: showUpdatedRoutineList,
    }),
  );

  const exerciseNames = new Map(
    exerciseLibrary.data?.map(
      (exercise) => [exercise.id, exercise.name] as const,
    ),
  );
  const isRoutineChangePending =
    saveRoutine.isPending || deleteRoutine.isPending;
  const isRoutineDraftInvalid =
    shouldShowValidationErrors && hasRoutineDraftValidationErrors(routineDraft);
  const routineNameValidationError = shouldShowValidationErrors
    ? getRoutineNameValidationError(routineDraft.name)
    : undefined;
  const routineChangeErrorMessage = getRoutineChangeErrorMessage();

  function getRoutineChangeErrorMessage() {
    if (saveRoutine.error) {
      return getRoutineSaveErrorMessage(saveRoutine.error);
    }

    if (deleteRoutine.error) {
      return getTrpcErrorMessage(deleteRoutine.error);
    }

    return isRoutineDraftInvalid
      ? messages.routineEditor.routineDraftInvalidError
      : undefined;
  }

  function handleChangeDays(days: DayOfWeek[]) {
    dispatchRoutineDraftAction({ days, type: "changedDays" });
  }

  function handleChangeName(name: string) {
    dispatchRoutineDraftAction({ name, type: "changedName" });
  }

  function handleDeleteRoutine() {
    if (isRoutineChangePending) {
      return;
    }

    saveRoutine.reset();

    deleteRoutine.mutate({ id: routineDraft.id });
  }

  function handleDismissExercisePicker() {
    setExercisePickerTarget(undefined);
  }

  function handleSaveRoutine() {
    if (isRoutineChangePending) {
      return;
    }

    setShouldShowValidationErrors(true);
    saveRoutine.reset();
    deleteRoutine.reset();

    if (hasRoutineDraftValidationErrors(routineDraft)) {
      announceMessage(messages.routineEditor.routineDraftInvalidError);

      return;
    }

    saveRoutine.mutate(buildRoutineSaveInput(routineDraft));
  }

  function handleSelectExercise(exercise: Exercise) {
    if (!exercisePickerTarget) {
      return;
    }

    if ("section" in exercisePickerTarget) {
      dispatchRoutineDraftAction({
        exerciseId: exercise.id,
        routineDraftBlockId: createIdentifier(),
        routineExerciseId: createIdentifier(),
        section: exercisePickerTarget.section,
        type: "addedExercise",
      });
    } else {
      dispatchRoutineDraftAction({
        exerciseId: exercise.id,
        routineExerciseId: createIdentifier(),
        type: "addedWarmUpExercise",
        warmUpForRoutineExerciseId:
          exercisePickerTarget.warmUpForRoutineExerciseId,
      });
    }

    setExercisePickerTarget(undefined);
  }

  function showUpdatedRoutineList() {
    void queryClient.invalidateQueries({
      queryKey: trpc.routine.list.queryKey(),
    });

    router.dismissTo("/");
  }

  return (
    <>
      <ScrollView>
        <TextField
          errorMessage={routineNameValidationError}
          label={messages.routineEditor.routineNameLabel}
          onChangeText={handleChangeName}
          value={routineDraft.name}
        />
        <CheckboxGroup
          label={messages.routineEditor.daysLabel}
          onChangeSelectedOptions={handleChangeDays}
          optionLabels={DAY_OF_WEEK_LABELS}
          options={DAYS_OF_WEEK}
          selectedOptions={routineDraft.days}
        />
        {SECTIONS.map((section) => (
          <RoutineEditorSection
            dispatchRoutineDraftAction={dispatchRoutineDraftAction}
            exerciseNames={exerciseNames}
            key={section}
            onOpenExercisePicker={setExercisePickerTarget}
            routineDraftBlocks={routineDraft.sections[section]}
            section={section}
            shouldShowValidationErrors={shouldShowValidationErrors}
          />
        ))}
        <Button
          isBusy={saveRoutine.isPending}
          onPress={handleSaveRoutine}
          title={messages.routineEditor.saveRoutineButton}
        />
        {routine ? (
          <Button
            isBusy={deleteRoutine.isPending}
            onPress={handleDeleteRoutine}
            title={messages.routineEditor.deleteRoutineButton}
          />
        ) : null}
        <StatusMessage message={routineChangeErrorMessage} />
      </ScrollView>
      <BottomSheet
        isPresented={!!exercisePickerTarget}
        onDismiss={handleDismissExercisePicker}
        snapPoints={EXERCISE_PICKER_SNAP_POINTS}
      >
        <RNHostView>
          <ExercisePicker onSelectExercise={handleSelectExercise} />
        </RNHostView>
      </BottomSheet>
    </>
  );
}

function buildRoutineExerciseSetSaveInput({
  position,
  routineDraftExerciseSet,
}: BuildRoutineExerciseSetSaveInputOptions) {
  const isRestPause = routineDraftExerciseSet.variation === "rest_pause";
  const isDropSet = routineDraftExerciseSet.variation === "drop_set";

  return {
    amount: parseOptionalWholeNumber(routineDraftExerciseSet.amount),
    dropSetSegmentCount: parseOptionalWholeNumber(
      isDropSet ? routineDraftExerciseSet.dropSetSegmentCount : "",
    ),
    dropSetWeightPercentage: parseOptionalWholeNumber(
      isDropSet ? routineDraftExerciseSet.dropSetWeightPercentage : "",
    ),
    id: routineDraftExerciseSet.id,
    isToFailure: routineDraftExerciseSet.isToFailure,
    position,
    restPauseRestSeconds: parseOptionalWholeNumber(
      isRestPause ? routineDraftExerciseSet.restPauseRestSeconds : "",
    ),
    restPauseSegmentCount: parseOptionalWholeNumber(
      isRestPause ? routineDraftExerciseSet.restPauseSegmentCount : "",
    ),
    restSeconds: parseOptionalWholeNumber(routineDraftExerciseSet.restSeconds),
    setType: routineDraftExerciseSet.setType,
    tempo: convertUndefinedToNull(
      formatTempo(routineDraftExerciseSet.tempo) || undefined,
    ),
    variation: convertUndefinedToNull(routineDraftExerciseSet.variation),
  } satisfies RoutineExerciseSetSaveInput;
}

function buildRoutineSaveInput(routineDraft: RoutineDraft) {
  return {
    days: DAYS_OF_WEEK.filter((dayOfWeek) =>
      routineDraft.days.includes(dayOfWeek),
    ),
    exercises: getRoutineDraftPlacedExercises(routineDraft).map(
      (routineDraftPlacedExercise, position) => ({
        exerciseId: routineDraftPlacedExercise.routineDraftExercise.exerciseId,
        id: routineDraftPlacedExercise.routineDraftExercise.id,
        note: convertUndefinedToNull(
          routineDraftPlacedExercise.routineDraftExercise.note.trim() ||
            undefined,
        ),
        position,
        section: routineDraftPlacedExercise.section,
        sets: routineDraftPlacedExercise.routineDraftExercise.sets.map(
          (routineDraftExerciseSet, setPosition) =>
            buildRoutineExerciseSetSaveInput({
              position: setPosition,
              routineDraftExerciseSet,
            }),
        ),
        superset: convertUndefinedToNull(routineDraftPlacedExercise.superset),
        warmUpForRoutineExerciseId: convertUndefinedToNull(
          routineDraftPlacedExercise.warmUpForRoutineExerciseId,
        ),
      }),
    ),
    id: routineDraft.id,
    name: routineDraft.name.trim(),
  } satisfies RoutineSaveInput;
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

function convertUndefinedToNull<TValue>(optionalValue: TValue | undefined) {
  if (optionalValue === undefined) {
    return null;
  }

  return optionalValue;
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

function createIdentifier() {
  return v7({ random: ExpoCrypto.getRandomBytes(UUID_RANDOM_BYTE_COUNT) });
}

function createRoutineDraft(routine: Routine | undefined) {
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
        id: createIdentifier(),
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
        id: createIdentifier(),
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

function createRoutineDraftSections(
  getRoutineDraftBlocks: (section: Section) => RoutineDraftBlock[],
) {
  return {
    cool_down: getRoutineDraftBlocks("cool_down"),
    main: getRoutineDraftBlocks(MAIN_SECTION),
    warm_up: getRoutineDraftBlocks(WARM_UP_SECTION),
  } satisfies Record<Section, RoutineDraftBlock[]>;
}

function formatTempo(tempoText: string) {
  return tempoText.trim().toUpperCase();
}

function getRoutineDraftExerciseSetValidationErrors(
  routineDraftExerciseSet: RoutineDraftExerciseSet,
) {
  const isRestPause = routineDraftExerciseSet.variation === "rest_pause";
  const isDropSet = routineDraftExerciseSet.variation === "drop_set";

  return {
    amount: getWholeNumberValidationError({
      isRequired: false,
      minimum: AMOUNT_MINIMUM,
      wholeNumberText: routineDraftExerciseSet.amount,
    }),
    dropSetSegmentCount: isDropSet
      ? getWholeNumberValidationError({
          isRequired: true,
          minimum: SEGMENT_COUNT_MINIMUM,
          wholeNumberText: routineDraftExerciseSet.dropSetSegmentCount,
        })
      : undefined,
    dropSetWeightPercentage: isDropSet
      ? getWholeNumberValidationError({
          isRequired: false,
          maximum: DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
          minimum: DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
          wholeNumberText: routineDraftExerciseSet.dropSetWeightPercentage,
        })
      : undefined,
    restPauseRestSeconds: isRestPause
      ? getWholeNumberValidationError({
          isRequired: true,
          minimum: REST_SECONDS_MINIMUM,
          wholeNumberText: routineDraftExerciseSet.restPauseRestSeconds,
        })
      : undefined,
    restPauseSegmentCount: isRestPause
      ? getWholeNumberValidationError({
          isRequired: true,
          minimum: SEGMENT_COUNT_MINIMUM,
          wholeNumberText: routineDraftExerciseSet.restPauseSegmentCount,
        })
      : undefined,
    restSeconds: getWholeNumberValidationError({
      isRequired: false,
      minimum: REST_SECONDS_MINIMUM,
      wholeNumberText: routineDraftExerciseSet.restSeconds,
    }),
    tempo: getTempoValidationError(routineDraftExerciseSet.tempo),
  };
}

function getRoutineDraftPlacedExercises(routineDraft: RoutineDraft) {
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

function getRoutineNameValidationError(routineName: string) {
  return routineName.trim()
    ? undefined
    : messages.routineEditor.routineNameEmptyError;
}

function getRoutineSaveErrorMessage(error: TRPCClientErrorLike<AppRouter>) {
  if (error.data?.code === "CONFLICT") {
    return messages.routineEditor.routineNameTakenError;
  }

  return getTrpcErrorMessage(error);
}

function getTempoValidationError(tempoText: string) {
  const tempo = formatTempo(tempoText);

  if (!tempo || TEMPO_PATTERN.test(tempo)) {
    return undefined;
  }

  return messages.routineEditor.tempoFormatError;
}

function getWholeNumberValidationError({
  isRequired,
  maximum,
  minimum,
  wholeNumberText,
}: GetWholeNumberValidationErrorOptions) {
  const trimmedWholeNumberText = wholeNumberText.trim();
  const wholeNumber = Number(trimmedWholeNumberText);

  const isWholeNumberValid =
    WHOLE_NUMBER_PATTERN.test(trimmedWholeNumberText) &&
    wholeNumber >= minimum &&
    (maximum === undefined || wholeNumber <= maximum);

  if ((!trimmedWholeNumberText && !isRequired) || isWholeNumberValid) {
    return undefined;
  }

  return maximum === undefined
    ? messages.routineEditor.wholeNumberMinimumError(minimum)
    : messages.routineEditor.wholeNumberRangeError({ maximum, minimum });
}

function hasRoutineDraftValidationErrors(routineDraft: RoutineDraft) {
  return (
    !!getRoutineNameValidationError(routineDraft.name) ||
    getRoutineDraftPlacedExercises(routineDraft).some(
      (routineDraftPlacedExercise) =>
        routineDraftPlacedExercise.routineDraftExercise.sets.some(
          (routineDraftExerciseSet) =>
            Object.values(
              getRoutineDraftExerciseSetValidationErrors(
                routineDraftExerciseSet,
              ),
            ).some((validationError) => !!validationError),
        ),
    )
  );
}

function joinRoutineDraftBlockWithNextBlock({
  routineDraftBlockId,
  routineDraftBlocks,
}: JoinRoutineDraftBlockWithNextBlockOptions) {
  const routineDraftBlockIndex = routineDraftBlocks.findIndex(
    (routineDraftBlock) => routineDraftBlock.id === routineDraftBlockId,
  );
  const nextRoutineDraftBlockIndex = routineDraftBlockIndex + 1;
  const routineDraftBlock = routineDraftBlocks.at(routineDraftBlockIndex);
  const nextRoutineDraftBlock = routineDraftBlocks.at(
    nextRoutineDraftBlockIndex,
  );

  if (
    routineDraftBlockIndex < 0 ||
    !routineDraftBlock ||
    !nextRoutineDraftBlock
  ) {
    return routineDraftBlocks;
  }

  return [
    ...routineDraftBlocks.slice(0, routineDraftBlockIndex),
    {
      exercises: [
        ...routineDraftBlock.exercises,
        ...nextRoutineDraftBlock.exercises,
      ],
      id: routineDraftBlock.id,
      warmUpExercises: [
        ...routineDraftBlock.warmUpExercises,
        ...nextRoutineDraftBlock.warmUpExercises,
      ],
    },
    ...routineDraftBlocks.slice(nextRoutineDraftBlockIndex + 1),
  ];
}

function moveRoutineDraftBlock({
  routineDraftBlockId,
  routineDraftBlockMoveDirection,
  routineDraftBlocks,
}: MoveRoutineDraftBlockOptions) {
  const routineDraftBlockIndex = routineDraftBlocks.findIndex(
    (routineDraftBlock) => routineDraftBlock.id === routineDraftBlockId,
  );
  const neighborRoutineDraftBlockIndex =
    routineDraftBlockMoveDirection === "up"
      ? routineDraftBlockIndex - 1
      : routineDraftBlockIndex + 1;
  const routineDraftBlock = routineDraftBlocks.at(routineDraftBlockIndex);
  const neighborRoutineDraftBlock = routineDraftBlocks.at(
    neighborRoutineDraftBlockIndex,
  );

  if (
    routineDraftBlockIndex < 0 ||
    neighborRoutineDraftBlockIndex < 0 ||
    !routineDraftBlock ||
    !neighborRoutineDraftBlock
  ) {
    return routineDraftBlocks;
  }

  const movedRoutineDraftBlocks = [...routineDraftBlocks];

  movedRoutineDraftBlocks[routineDraftBlockIndex] = neighborRoutineDraftBlock;
  movedRoutineDraftBlocks[neighborRoutineDraftBlockIndex] = routineDraftBlock;

  return movedRoutineDraftBlocks;
}

function parseOptionalWholeNumber(wholeNumberText: string) {
  const trimmedWholeNumberText = wholeNumberText.trim();

  return convertUndefinedToNull(
    trimmedWholeNumberText ? Number(trimmedWholeNumberText) : undefined,
  );
}

function routineDraftReducer(
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

function RoutineEditorBlock({
  dispatchRoutineDraftAction,
  exerciseNames,
  isFirstRoutineDraftBlock,
  isLastRoutineDraftBlock,
  onOpenExercisePicker,
  routineDraftBlock,
  section,
  shouldShowValidationErrors,
}: RoutineEditorBlockProperties) {
  const isSuperset =
    routineDraftBlock.exercises.length >= SUPERSET_EXERCISE_COUNT_MINIMUM;

  function getWarmUpForExerciseName(
    routineDraftWarmUpExercise: RoutineDraftWarmUpExercise,
  ) {
    const warmUpForRoutineDraftExercise = routineDraftBlock.exercises.find(
      (routineDraftExercise) =>
        routineDraftExercise.id ===
        routineDraftWarmUpExercise.warmUpForRoutineExerciseId,
    );

    return (
      exerciseNames.get(warmUpForRoutineDraftExercise?.exerciseId ?? "") ?? ""
    );
  }

  function handleJoinSupersetWithNextBlock() {
    dispatchRoutineDraftAction({
      routineDraftBlockId: routineDraftBlock.id,
      section,
      type: "joinedSupersetWithNextBlock",
    });
  }

  function handleMoveBlock(
    routineDraftBlockMoveDirection: RoutineDraftBlockMoveDirection,
  ) {
    dispatchRoutineDraftAction({
      routineDraftBlockId: routineDraftBlock.id,
      routineDraftBlockMoveDirection,
      section,
      type: "movedBlock",
    });
  }

  return (
    <>
      {isSuperset ? <Text>{messages.routineEditor.supersetLabel}</Text> : null}
      {routineDraftBlock.warmUpExercises.map((routineDraftWarmUpExercise) => (
        <RoutineEditorExercise
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          exerciseNames={exerciseNames}
          key={routineDraftWarmUpExercise.id}
          onOpenExercisePicker={onOpenExercisePicker}
          routineDraftExercise={routineDraftWarmUpExercise}
          shouldShowValidationErrors={shouldShowValidationErrors}
          warmUpForExerciseName={getWarmUpForExerciseName(
            routineDraftWarmUpExercise,
          )}
        />
      ))}
      {routineDraftBlock.exercises.map((routineDraftExercise) => (
        <RoutineEditorExercise
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          exerciseNames={exerciseNames}
          key={routineDraftExercise.id}
          onAddWarmUpExercise={
            section === MAIN_SECTION
              ? () => {
                  onOpenExercisePicker({
                    warmUpForRoutineExerciseId: routineDraftExercise.id,
                  });
                }
              : undefined
          }
          onLeaveSuperset={
            isSuperset
              ? () => {
                  dispatchRoutineDraftAction({
                    routineDraftBlockId: createIdentifier(),
                    routineExerciseId: routineDraftExercise.id,
                    section,
                    type: "leftSuperset",
                  });
                }
              : undefined
          }
          onOpenExercisePicker={onOpenExercisePicker}
          routineDraftExercise={routineDraftExercise}
          shouldShowValidationErrors={shouldShowValidationErrors}
        />
      ))}
      <Button
        disabled={isFirstRoutineDraftBlock}
        onPress={() => {
          handleMoveBlock("up");
        }}
        title={messages.routineEditor.moveUpButton}
      />
      <Button
        disabled={isLastRoutineDraftBlock}
        onPress={() => {
          handleMoveBlock("down");
        }}
        title={messages.routineEditor.moveDownButton}
      />
      <Button
        disabled={isLastRoutineDraftBlock}
        onPress={handleJoinSupersetWithNextBlock}
        title={messages.routineEditor.joinSupersetButton}
      />
    </>
  );
}

function RoutineEditorExercise({
  dispatchRoutineDraftAction,
  exerciseNames,
  onAddWarmUpExercise,
  onLeaveSuperset,
  routineDraftExercise,
  shouldShowValidationErrors,
  warmUpForExerciseName,
}: RoutineEditorExerciseProperties) {
  function handleAddSet() {
    dispatchRoutineDraftAction({
      routineExerciseId: routineDraftExercise.id,
      routineExerciseSetId: createIdentifier(),
      type: "addedSet",
    });
  }

  function handleChangeNote(note: string) {
    dispatchRoutineDraftAction({
      note,
      routineExerciseId: routineDraftExercise.id,
      type: "changedExerciseNote",
    });
  }

  function handleRemoveExercise() {
    dispatchRoutineDraftAction({
      routineExerciseId: routineDraftExercise.id,
      type: "removedExercise",
    });
  }

  return (
    <>
      <Text>{exerciseNames.get(routineDraftExercise.exerciseId)}</Text>
      {typeof warmUpForExerciseName === "string" ? (
        <Text>
          {messages.routineEditor.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      ) : null}
      <TextField
        label={messages.routineEditor.exerciseNoteLabel}
        multiline
        onChangeText={handleChangeNote}
        value={routineDraftExercise.note}
      />
      {routineDraftExercise.sets.map((routineDraftExerciseSet, setIndex) => (
        <RoutineEditorSet
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          key={routineDraftExerciseSet.id}
          routineDraftExerciseSet={routineDraftExerciseSet}
          routineExerciseId={routineDraftExercise.id}
          setNumber={setIndex + 1}
          shouldShowValidationErrors={shouldShowValidationErrors}
        />
      ))}
      <Button
        onPress={handleAddSet}
        title={messages.routineEditor.addSetButton}
      />
      {onAddWarmUpExercise ? (
        <Button
          onPress={onAddWarmUpExercise}
          title={messages.routineEditor.addWarmUpExerciseButton}
        />
      ) : null}
      {onLeaveSuperset ? (
        <Button
          onPress={onLeaveSuperset}
          title={messages.routineEditor.leaveSupersetButton}
        />
      ) : null}
      <Button
        onPress={handleRemoveExercise}
        title={messages.routineEditor.removeExerciseButton}
      />
    </>
  );
}

function RoutineEditorPicker<TPickerValue extends PickerItemValue>({
  label,
  onChangeSelectedValue,
  optionLabels,
  options,
  selectedValue,
}: RoutineEditorPickerProperties<TPickerValue>) {
  return (
    <>
      <Text>{label}</Text>
      <Host matchContents>
        <Picker
          onValueChange={onChangeSelectedValue}
          selectedValue={selectedValue}
        >
          {options.map((option) => (
            <Picker.Item
              key={option}
              label={optionLabels[option]}
              value={option}
            />
          ))}
        </Picker>
      </Host>
    </>
  );
}

function RoutineEditorSection({
  dispatchRoutineDraftAction,
  exerciseNames,
  onOpenExercisePicker,
  routineDraftBlocks,
  section,
  shouldShowValidationErrors,
}: RoutineEditorSectionProperties) {
  return (
    <>
      <Text>{SECTION_LABELS[section]}</Text>
      {routineDraftBlocks.map((routineDraftBlock, routineDraftBlockIndex) => (
        <RoutineEditorBlock
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          exerciseNames={exerciseNames}
          isFirstRoutineDraftBlock={routineDraftBlockIndex === 0}
          isLastRoutineDraftBlock={
            routineDraftBlockIndex === routineDraftBlocks.length - 1
          }
          key={routineDraftBlock.id}
          onOpenExercisePicker={onOpenExercisePicker}
          routineDraftBlock={routineDraftBlock}
          section={section}
          shouldShowValidationErrors={shouldShowValidationErrors}
        />
      ))}
      <Button
        onPress={() => {
          onOpenExercisePicker({ section });
        }}
        title={messages.routineEditor.addExerciseButton}
      />
    </>
  );
}

function RoutineEditorSet({
  dispatchRoutineDraftAction,
  routineDraftExerciseSet,
  routineExerciseId,
  setNumber,
  shouldShowValidationErrors,
}: RoutineEditorSetProperties) {
  const validationErrors = shouldShowValidationErrors
    ? getRoutineDraftExerciseSetValidationErrors(routineDraftExerciseSet)
    : undefined;

  function handleChangeSet(
    routineDraftExerciseSetChanges: Partial<RoutineDraftExerciseSet>,
  ) {
    dispatchRoutineDraftAction({
      routineExerciseId,
      routineExerciseSet: {
        ...routineDraftExerciseSet,
        ...routineDraftExerciseSetChanges,
      },
      type: "changedSet",
    });
  }

  function handleChangeVariation(variationPickerValue: VariationPickerValue) {
    handleChangeSet({
      variation:
        variationPickerValue === NO_VARIATION_PICKER_VALUE
          ? undefined
          : variationPickerValue,
    });
  }

  function handleRemoveSet() {
    dispatchRoutineDraftAction({
      routineExerciseId,
      routineExerciseSetId: routineDraftExerciseSet.id,
      type: "removedSet",
    });
  }

  return (
    <>
      <Text>{messages.routineEditor.setLabel(setNumber)}</Text>
      <RoutineEditorPicker
        label={messages.routineEditor.setTypeLabel}
        onChangeSelectedValue={(setType) => {
          handleChangeSet({ setType });
        }}
        optionLabels={SET_TYPE_LABELS}
        options={SET_TYPES}
        selectedValue={routineDraftExerciseSet.setType}
      />
      <TextField
        errorMessage={validationErrors?.amount}
        inputMode="numeric"
        label={messages.routineEditor.amountLabel}
        onChangeText={(amount) => {
          handleChangeSet({ amount });
        }}
        value={routineDraftExerciseSet.amount}
      />
      <TextField
        errorMessage={validationErrors?.restSeconds}
        inputMode="numeric"
        label={messages.routineEditor.restSecondsLabel}
        onChangeText={(restSeconds) => {
          handleChangeSet({ restSeconds });
        }}
        value={routineDraftExerciseSet.restSeconds}
      />
      <RoutineEditorPicker
        label={messages.routineEditor.variationLabel}
        onChangeSelectedValue={handleChangeVariation}
        optionLabels={VARIATION_PICKER_LABELS}
        options={VARIATION_PICKER_OPTIONS}
        selectedValue={
          routineDraftExerciseSet.variation ?? NO_VARIATION_PICKER_VALUE
        }
      />
      {routineDraftExerciseSet.variation === "rest_pause" ? (
        <>
          <TextField
            errorMessage={validationErrors?.restPauseRestSeconds}
            inputMode="numeric"
            label={messages.routineEditor.restPauseRestSecondsLabel}
            onChangeText={(restPauseRestSeconds) => {
              handleChangeSet({ restPauseRestSeconds });
            }}
            value={routineDraftExerciseSet.restPauseRestSeconds}
          />
          <TextField
            errorMessage={validationErrors?.restPauseSegmentCount}
            inputMode="numeric"
            label={messages.routineEditor.restPauseSegmentCountLabel}
            onChangeText={(restPauseSegmentCount) => {
              handleChangeSet({ restPauseSegmentCount });
            }}
            value={routineDraftExerciseSet.restPauseSegmentCount}
          />
        </>
      ) : null}
      {routineDraftExerciseSet.variation === "drop_set" ? (
        <>
          <TextField
            errorMessage={validationErrors?.dropSetSegmentCount}
            inputMode="numeric"
            label={messages.routineEditor.dropSetSegmentCountLabel}
            onChangeText={(dropSetSegmentCount) => {
              handleChangeSet({ dropSetSegmentCount });
            }}
            value={routineDraftExerciseSet.dropSetSegmentCount}
          />
          <TextField
            errorMessage={validationErrors?.dropSetWeightPercentage}
            inputMode="numeric"
            label={messages.routineEditor.dropSetWeightPercentageLabel}
            onChangeText={(dropSetWeightPercentage) => {
              handleChangeSet({ dropSetWeightPercentage });
            }}
            value={routineDraftExerciseSet.dropSetWeightPercentage}
          />
        </>
      ) : null}
      <Host matchContents>
        <Switch
          label={messages.routineEditor.toFailureLabel}
          onValueChange={(isToFailure) => {
            handleChangeSet({ isToFailure });
          }}
          value={routineDraftExerciseSet.isToFailure}
        />
      </Host>
      <TextField
        autoCapitalize="characters"
        autoCorrect={false}
        errorMessage={validationErrors?.tempo}
        label={messages.routineEditor.tempoLabel}
        onChangeText={(tempo) => {
          handleChangeSet({ tempo });
        }}
        value={routineDraftExerciseSet.tempo}
      />
      <Button
        onPress={handleRemoveSet}
        title={messages.routineEditor.removeSetButton}
      />
    </>
  );
}
