import type { Section } from "@ankaa/core/shared/constants/sections";

import type {
  RecordedSetDraftEntry,
  RecordedSetDraftsAction,
} from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExerciseGroup } from "#/features/workout/components/workout-exercise-group.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function WorkoutSection({
  dispatch,
  exerciseGroups,
  exerciseNames,
  recordedSetDraftEntries,
  section,
}: {
  dispatch: (action: RecordedSetDraftsAction) => void;
  exerciseGroups: Workout["sections"][keyof Workout["sections"]];
  exerciseNames: Map<string, string>;
  recordedSetDraftEntries: readonly RecordedSetDraftEntry[];
  section: Section;
}) {
  if (exerciseGroups.length === 0) {
    return null;
  }

  return (
    <>
      <Text>{SHARED_MESSAGES.sectionLabels[section]}</Text>
      {exerciseGroups.map((exerciseGroup) => (
        <WorkoutExerciseGroup
          dispatch={dispatch}
          exerciseGroup={exerciseGroup}
          exerciseNames={exerciseNames}
          key={exerciseGroup.id}
          recordedSetDraftEntries={recordedSetDraftEntries}
        />
      ))}
    </>
  );
}
