import type { Section } from "@ankaa/core/shared/constants/sections";

import type { ExercisePickerTarget } from "#/features/routine/core/exercise-picker-target.ts";
import type {
  ExerciseGroupDraft,
  MainExerciseGroupDraft,
  RoutineDraftAction,
} from "#/features/routine/core/routine-draft-reducer.ts";

import { RoutineEditorExerciseGroup } from "#/features/routine/components/routine-editor-exercise-group.tsx";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function RoutineEditorSection({
  dispatch,
  exerciseGroups,
  exerciseNames,
  hasSubmitted,
  onOpenExercisePicker,
  section,
}: {
  dispatch: (action: RoutineDraftAction) => void;
  exerciseGroups: readonly (ExerciseGroupDraft | MainExerciseGroupDraft)[];
  exerciseNames: ReadonlyMap<string, string>;
  hasSubmitted: boolean;
  onOpenExercisePicker: (exercisePickerTarget: ExercisePickerTarget) => void;
  section: Section;
}) {
  return (
    <>
      <Text>{SHARED_MESSAGES.sectionLabels[section]}</Text>
      {exerciseGroups.map((exerciseGroup, exerciseGroupIndex) => (
        <RoutineEditorExerciseGroup
          dispatch={dispatch}
          exerciseGroup={exerciseGroup}
          exerciseNames={exerciseNames}
          hasSubmitted={hasSubmitted}
          isFirst={exerciseGroupIndex === 0}
          isLast={exerciseGroupIndex === exerciseGroups.length - 1}
          key={exerciseGroup.id}
          onOpenExercisePicker={onOpenExercisePicker}
          section={section}
        />
      ))}
      <Button
        onPress={() => {
          onOpenExercisePicker({ section });
        }}
        title={ROUTINE_MESSAGES.addExerciseButton}
      />
    </>
  );
}
