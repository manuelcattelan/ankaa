import type { Equipment } from "@ankaa/core/features/exercise/constants/equipment";
import type { MuscleGroup } from "@ankaa/core/features/exercise/constants/muscle-group";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import type { Exercise } from "#/shared/exercise-application-service.ts";

import { getExerciseSearchOptions } from "#/features/exercise/core/get-exercise-search-options.ts";
import { searchExercises } from "#/features/exercise/core/search-exercises.ts";
import { EXERCISE_PICKER_MESSAGES } from "#/features/exercise/messages/exercise-picker-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { CheckboxGroup } from "#/shared/components/checkbox-group.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

type ExercisePickerContentProps = ExercisePickerProps & {
  exercises: Exercise[];
};

type ExercisePickerProps = {
  onSelectExercise: (exercise: Exercise) => void;
};

const EQUIPMENT_SELECTION_INITIAL_VALUE: Equipment[] = [];
const MUSCLE_GROUP_SELECTION_INITIAL_VALUE: MuscleGroup[] = [];

const EQUIPMENT_LABELS = {
  barbell: EXERCISE_PICKER_MESSAGES.barbellEquipmentLabel,
  bench: EXERCISE_PICKER_MESSAGES.benchEquipmentLabel,
  rack: EXERCISE_PICKER_MESSAGES.rackEquipmentLabel,
} satisfies Record<Equipment, string>;

const MUSCLE_GROUP_LABELS = {
  chest: EXERCISE_PICKER_MESSAGES.chestMuscleGroupLabel,
  front_deltoid: EXERCISE_PICKER_MESSAGES.frontDeltoidMuscleGroupLabel,
  triceps: EXERCISE_PICKER_MESSAGES.tricepsMuscleGroupLabel,
} satisfies Record<MuscleGroup, string>;

export function ExercisePicker({ onSelectExercise }: ExercisePickerProps) {
  const runtime = useRuntime();

  const exerciseLibrary = useQuery(exerciseListQueryOptions(runtime));

  const exerciseLibraryErrorMessage = exerciseLibrary.error
    ? getTrpcErrorMessage(exerciseLibrary.error)
    : null;

  useEffect(() => {
    if (exerciseLibraryErrorMessage) {
      runtime.runSync(announceMessage(exerciseLibraryErrorMessage));
    }
  }, [exerciseLibraryErrorMessage, runtime]);

  if (exerciseLibrary.isPending) {
    return <ActivityIndicator />;
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

function ExercisePickerContent({
  exercises,
  onSelectExercise,
}: ExercisePickerContentProps) {
  const [equipmentSelection, setEquipmentSelection] = useState(
    EQUIPMENT_SELECTION_INITIAL_VALUE,
  );
  const [exerciseNameSearchText, setExerciseNameSearchText] = useState("");
  const [muscleGroupSelection, setMuscleGroupSelection] = useState(
    MUSCLE_GROUP_SELECTION_INITIAL_VALUE,
  );

  const exerciseSearchOptions = getExerciseSearchOptions(exercises);
  const matchingExercises = searchExercises({
    equipmentSelection,
    exercises,
    muscleGroupSelection,
    nameSearchText: exerciseNameSearchText,
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
        errorMessage={null}
        inputMode="search"
        label={EXERCISE_PICKER_MESSAGES.exerciseNameLabel}
        onChangeText={setExerciseNameSearchText}
        value={exerciseNameSearchText}
      />
      <CheckboxGroup
        label={EXERCISE_PICKER_MESSAGES.muscleGroupsLabel}
        onChangeSelectedOptions={setMuscleGroupSelection}
        optionLabels={MUSCLE_GROUP_LABELS}
        options={exerciseSearchOptions.muscleGroups}
        selectedOptions={muscleGroupSelection}
      />
      <CheckboxGroup
        label={EXERCISE_PICKER_MESSAGES.equipmentLabel}
        onChangeSelectedOptions={setEquipmentSelection}
        optionLabels={EQUIPMENT_LABELS}
        options={exerciseSearchOptions.equipment}
        selectedOptions={equipmentSelection}
      />
      <StatusMessage
        message={
          matchingExercises.length === 0
            ? EXERCISE_PICKER_MESSAGES.exerciseListEmptyStatus
            : null
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
