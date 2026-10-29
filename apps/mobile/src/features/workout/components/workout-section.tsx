import type { Section } from "@ankaa/core/shared/constants/sections";

import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExerciseGroup } from "#/features/workout/components/workout-exercise-group.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function WorkoutSection({
  exerciseGroups,
  exerciseNames,
  section,
}: {
  exerciseGroups: Workout["sections"][keyof Workout["sections"]];
  exerciseNames: Map<string, string>;
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
          exerciseNames={exerciseNames}
          key={exerciseGroup.id}
        />
      ))}
    </>
  );
}
