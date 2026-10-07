import type { AppRouter } from "@ankaa/api";
import type { inferRouterOutputs } from "@trpc/server";

import { Checkbox, Column, Host } from "@expo/ui";
import { useQuery } from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import { useEffect, useState } from "react";
import * as ReactNative from "react-native";

import { useTrpc } from "@/clients/trpc";
import { Button } from "@/components/button";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { announceMessage } from "@/utilities/accessibility";
import { messages } from "@/utilities/messages";

type Equipment = Exercise["exerciseEquipment"][number]["equipment"];

type Exercise = inferRouterOutputs<AppRouter>["exercise"]["list"][number];

type ExerciseFilterCheckboxGroupProperties<TFilterOption extends string> = {
  filter: TFilterOption[];
  filterOptionLabels: Record<TFilterOption, string>;
  filterOptions: TFilterOption[];
  label: string;
  onChangeFilter: (filter: TFilterOption[]) => void;
};

type ExercisePickerContentProperties = ExercisePickerProperties & {
  exercises: Exercise[];
};

type ExercisePickerProperties = {
  onSelectExercise: (exercise: Exercise) => void;
};

type FilterExercisesOptions = {
  equipmentFilter: Equipment[];
  exerciseNameFilter: string;
  exercises: Exercise[];
  muscleGroupFilter: MuscleGroup[];
};

type MuscleGroup = Exercise["exerciseMuscleGroups"][number]["muscleGroup"];

const EXERCISE_NAME_FILTER_WORD_SEPARATOR = /\s+/;

const EQUIPMENT_FILTER_INITIAL_VALUE: Equipment[] = [];
const MUSCLE_GROUP_FILTER_INITIAL_VALUE: MuscleGroup[] = [];

const EQUIPMENT_LABELS = {
  barbell: messages.exercisePicker.barbellEquipmentLabel,
  bench: messages.exercisePicker.benchEquipmentLabel,
  rack: messages.exercisePicker.rackEquipmentLabel,
} satisfies Record<Equipment, string>;

const MUSCLE_GROUP_LABELS = {
  chest: messages.exercisePicker.chestMuscleGroupLabel,
  front_deltoid: messages.exercisePicker.frontDeltoidMuscleGroupLabel,
  triceps: messages.exercisePicker.tricepsMuscleGroupLabel,
} satisfies Record<MuscleGroup, string>;

export function ExercisePicker({ onSelectExercise }: ExercisePickerProperties) {
  const trpc = useTrpc();

  const exerciseLibrary = useQuery(trpc.exercise.list.queryOptions());

  const exerciseLibraryErrorMessage = exerciseLibrary.error
    ? getTrpcErrorMessage(exerciseLibrary.error)
    : undefined;

  useEffect(() => {
    if (exerciseLibraryErrorMessage) {
      announceMessage(exerciseLibraryErrorMessage);
    }
  }, [exerciseLibraryErrorMessage]);

  if (exerciseLibrary.isPending) {
    return <ReactNative.ActivityIndicator />;
  }

  if (exerciseLibrary.isError) {
    return <StatusMessage message={exerciseLibraryErrorMessage} />;
  }

  return (
    <ExercisePickerContent
      exercises={exerciseLibrary.data}
      onSelectExercise={onSelectExercise}
    />
  );
}

function ExerciseFilterCheckboxGroup<TFilterOption extends string>({
  filter,
  filterOptionLabels,
  filterOptions,
  label,
  onChangeFilter,
}: ExerciseFilterCheckboxGroupProperties<TFilterOption>) {
  function handleToggleFilterOption(filterOption: TFilterOption) {
    onChangeFilter(
      filter.includes(filterOption)
        ? filter.filter(
            (selectedFilterOption) => selectedFilterOption !== filterOption,
          )
        : [...filter, filterOption],
    );
  }

  return (
    <>
      <Text>{label}</Text>
      <Host matchContents>
        <Column>
          {filterOptions.map((filterOption) => (
            <Checkbox
              key={filterOption}
              label={filterOptionLabels[filterOption]}
              onValueChange={() => {
                handleToggleFilterOption(filterOption);
              }}
              value={filter.includes(filterOption)}
            />
          ))}
        </Column>
      </Host>
    </>
  );
}

function ExercisePickerContent({
  exercises,
  onSelectExercise,
}: ExercisePickerContentProperties) {
  const [equipmentFilter, setEquipmentFilter] = useState(
    EQUIPMENT_FILTER_INITIAL_VALUE,
  );
  const [exerciseNameFilter, setExerciseNameFilter] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState(
    MUSCLE_GROUP_FILTER_INITIAL_VALUE,
  );

  const equipmentFilterOptions = [
    ...new Set(
      exercises.flatMap((exercise) =>
        exercise.exerciseEquipment.map(
          (exerciseEquipment) => exerciseEquipment.equipment,
        ),
      ),
    ),
  ];
  const muscleGroupFilterOptions = [
    ...new Set(
      exercises.flatMap((exercise) =>
        exercise.exerciseMuscleGroups.map(
          (exerciseMuscleGroup) => exerciseMuscleGroup.muscleGroup,
        ),
      ),
    ),
  ];
  const matchingExercises = filterExercises({
    equipmentFilter,
    exerciseNameFilter,
    exercises,
    muscleGroupFilter,
  });

  function handleSelectExercise(exercise: Exercise) {
    onSelectExercise(exercise);
  }

  return (
    <ScrollView>
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        enterKeyHint="search"
        inputMode="search"
        label={messages.exercisePicker.exerciseNameFilterLabel}
        onChangeText={setExerciseNameFilter}
        value={exerciseNameFilter}
      />
      <ExerciseFilterCheckboxGroup
        filter={muscleGroupFilter}
        filterOptionLabels={MUSCLE_GROUP_LABELS}
        filterOptions={muscleGroupFilterOptions}
        label={messages.exercisePicker.muscleGroupFilterLabel}
        onChangeFilter={setMuscleGroupFilter}
      />
      <ExerciseFilterCheckboxGroup
        filter={equipmentFilter}
        filterOptionLabels={EQUIPMENT_LABELS}
        filterOptions={equipmentFilterOptions}
        label={messages.exercisePicker.equipmentFilterLabel}
        onChangeFilter={setEquipmentFilter}
      />
      <StatusMessage
        message={
          matchingExercises.length === 0
            ? messages.exercisePicker.exerciseListEmptyStatus
            : undefined
        }
      />
      {matchingExercises.map((exercise) => (
        <Button
          key={exercise.id}
          onPress={() => {
            handleSelectExercise(exercise);
          }}
          title={exercise.name}
        />
      ))}
    </ScrollView>
  );
}

function filterExercises({
  equipmentFilter,
  exerciseNameFilter,
  exercises,
  muscleGroupFilter,
}: FilterExercisesOptions) {
  const exerciseNameFilterWords = exerciseNameFilter
    .trim()
    .toLowerCase()
    .split(EXERCISE_NAME_FILTER_WORD_SEPARATOR);

  return exercises.filter((exercise) => {
    const exerciseName = exercise.name.toLowerCase();

    const hasExerciseNameMatch = exerciseNameFilterWords.every(
      (exerciseNameFilterWord) => exerciseName.includes(exerciseNameFilterWord),
    );
    const hasMuscleGroupMatch =
      muscleGroupFilter.length === 0 ||
      exercise.exerciseMuscleGroups.some((exerciseMuscleGroup) =>
        muscleGroupFilter.includes(exerciseMuscleGroup.muscleGroup),
      );
    const hasEquipmentMatch =
      equipmentFilter.length === 0 ||
      exercise.exerciseEquipment.every((exerciseEquipment) =>
        equipmentFilter.includes(exerciseEquipment.equipment),
      );

    return hasExerciseNameMatch && hasMuscleGroupMatch && hasEquipmentMatch;
  });
}

function getTrpcErrorMessage(error: unknown) {
  if (isTRPCClientError(error) && error.data) {
    return messages.error.unknown;
  }

  return messages.error.serverUnreachable;
}
