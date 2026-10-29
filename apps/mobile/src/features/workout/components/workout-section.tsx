import type { Section } from "@ankaa/core/shared/constants/sections";

import type { Workout } from "#/shared/workout.ts";

import { WorkoutExerciseGroup } from "#/features/workout/components/workout-exercise-group.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function WorkoutSection({
  exerciseGroups,
  section,
}: {
  exerciseGroups: Workout["sections"][keyof Workout["sections"]];
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
          exerciseGroup={exerciseGroup}
          key={exerciseGroup.id}
        />
      ))}
    </>
  );
}
