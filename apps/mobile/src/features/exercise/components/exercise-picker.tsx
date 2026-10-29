import type { Equipment } from "@ankaa/core/features/exercise/constants/equipment";
import type { MuscleGroup } from "@ankaa/core/features/exercise/constants/muscle-group";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import type { Exercise } from "@/shared/exercise-application-service";

import { getExerciseSearchOptions } from "@/features/exercise/core/get-exercise-search-options";
import { searchExercises } from "@/features/exercise/core/search-exercises";
import { exercisePickerMessages } from "@/features/exercise/messages/exercise-picker-messages";
import { Button } from "@/shared/components/button";
import { CheckboxGroup } from "@/shared/components/checkbox-group";
import { ScrollView } from "@/shared/components/scroll-view";
import { StatusMessage } from "@/shared/components/status-message";
import { TextField } from "@/shared/components/text-field";
import { getTrpcErrorMessage } from "@/shared/core/get-trpc-error-message";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";
import { createExerciseListQueryOptions } from "@/shared/queries/create-exercise-list-query-options";

type ExercisePickerContentProperties = ExercisePickerProperties & {
  exercises: Exercise[];
};

type ExercisePickerProperties = {
  onSelectExercise: (exercise: Exercise) => void;
};

const EQUIPMENT_SELECTION_INITIAL_VALUE: Equipment[] = [];
const MUSCLE_GROUP_SELECTION_INITIAL_VALUE: MuscleGroup[] = [];

const EQUIPMENT_LABELS = {
  barbell: exercisePickerMessages.barbellEquipmentLabel,
  bench: exercisePickerMessages.benchEquipmentLabel,
  rack: exercisePickerMessages.rackEquipmentLabel,
} satisfies Record<Equipment, string>;

const MUSCLE_GROUP_LABELS = {
  chest: exercisePickerMessages.chestMuscleGroupLabel,
  front_deltoid: exercisePickerMessages.frontDeltoidMuscleGroupLabel,
  triceps: exercisePickerMessages.tricepsMuscleGroupLabel,
} satisfies Record<MuscleGroup, string>;

export function ExercisePicker({ onSelectExercise }: ExercisePickerProperties) {
  const runtime = useRuntime();

  const exerciseLibrary = useQuery(createExerciseListQueryOptions(runtime));

  const exerciseLibraryErrorMessage = exerciseLibrary.error
    ? getTrpcErrorMessage(exerciseLibrary.error)
    : undefined;

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
}: ExercisePickerContentProperties) {
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
    exerciseNameSearchText,
    exercises,
    muscleGroupSelection,
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
        label={exercisePickerMessages.exerciseNameLabel}
        onChangeText={setExerciseNameSearchText}
        value={exerciseNameSearchText}
      />
      <CheckboxGroup
        label={exercisePickerMessages.muscleGroupsLabel}
        onChangeSelectedOptions={setMuscleGroupSelection}
        optionLabels={MUSCLE_GROUP_LABELS}
        options={exerciseSearchOptions.muscleGroupOptions}
        selectedOptions={muscleGroupSelection}
      />
      <CheckboxGroup
        label={exercisePickerMessages.equipmentLabel}
        onChangeSelectedOptions={setEquipmentSelection}
        optionLabels={EQUIPMENT_LABELS}
        options={exerciseSearchOptions.equipmentOptions}
        selectedOptions={equipmentSelection}
      />
      <StatusMessage
        message={
          matchingExercises.length === 0
            ? exercisePickerMessages.exerciseListEmptyStatus
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
