import type { Equipment } from "@ankaa/core/features/exercise/constants/equipment";
import type { MuscleGroup } from "@ankaa/core/features/exercise/constants/muscle-group";

import { useState } from "react";

import type { Exercise } from "#/shared/exercise-application-service.ts";

import { getExerciseSearchOptions } from "#/features/exercise/core/get-exercise-search-options.ts";
import { searchExercises } from "#/features/exercise/core/search-exercises.ts";
import { EXERCISE_MESSAGES } from "#/features/exercise/messages/exercise-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { CheckboxGroup } from "#/shared/components/checkbox-group.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";

const EQUIPMENT_SELECTION_INITIAL_VALUE: Equipment[] = [];
const MUSCLE_GROUP_SELECTION_INITIAL_VALUE: MuscleGroup[] = [];

export function ExercisePickerContent({
  exercises,
  onSelectExercise,
}: {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}) {
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

  return (
    <ScrollView>
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        enterKeyHint="search"
        errorMessage={null}
        inputMode="search"
        label={EXERCISE_MESSAGES.nameLabel}
        onChangeText={setExerciseNameSearchText}
        value={exerciseNameSearchText}
      />
      <CheckboxGroup
        label={EXERCISE_MESSAGES.muscleGroupsLabel}
        onChangeSelectedOptions={setMuscleGroupSelection}
        optionLabels={EXERCISE_MESSAGES.muscleGroupLabels}
        options={exerciseSearchOptions.muscleGroups}
        selectedOptions={muscleGroupSelection}
      />
      <CheckboxGroup
        label={EXERCISE_MESSAGES.equipmentLabel}
        onChangeSelectedOptions={setEquipmentSelection}
        optionLabels={EXERCISE_MESSAGES.equipmentLabels}
        options={exerciseSearchOptions.equipment}
        selectedOptions={equipmentSelection}
      />
      <StatusMessage
        message={
          matchingExercises.length === 0
            ? EXERCISE_MESSAGES.listEmptyStatus
            : null
        }
      />
      {matchingExercises.map((exercise) => (
        <Button
          key={exercise.id}
          onPress={() => {
            onSelectExercise(exercise);
          }}
          title={exercise.name}
        />
      ))}
    </ScrollView>
  );
}
