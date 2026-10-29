import { useQuery } from "@tanstack/react-query";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

export function WorkoutResumeButton() {
  const runtime = useRuntime();

  const workoutInProgress = useQuery(
    workoutFindInProgressQueryOptions(runtime),
  );

  if (workoutInProgress.data === undefined || workoutInProgress.data === null) {
    return null;
  }

  return (
    <LinkButton href="/workout" title={WORKOUT_MESSAGES.resumeWorkoutButton} />
  );
}
