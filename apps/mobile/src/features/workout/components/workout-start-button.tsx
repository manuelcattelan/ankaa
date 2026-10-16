import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import type { Routine } from "@/shared/interactors/list-routines";

import { buildWorkoutDocument } from "@/features/workout/core/build-workout-document";
import { canStartWorkout } from "@/features/workout/core/can-start-workout";
import { useWorkoutDocuments } from "@/features/workout/hooks/use-workout-documents";
import { workoutStartButtonMessages } from "@/features/workout/messages/workout-start-button-messages";
import { Button } from "@/shared/components/button";
import { useAuthenticationClient } from "@/shared/hooks/use-authentication-client";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { createIdentifier } from "@/shared/interactors/create-identifier";
import { createExerciseListQueryOptions } from "@/shared/queries/create-exercise-list-query-options";

type WorkoutStartButtonProperties = {
  routine: Routine;
};

export function WorkoutStartButton({ routine }: WorkoutStartButtonProperties) {
  const router = useRouter();

  const runtime = useRuntime();

  const authenticationClient = useAuthenticationClient();

  const session = authenticationClient.betterAuthenticationClient.useSession();

  const workoutDocuments = useWorkoutDocuments();

  const exerciseLibrary = useQuery(createExerciseListQueryOptions(runtime));

  const exerciseIds = new Set(
    exerciseLibrary.data?.map((exercise) => exercise.id),
  );

  if (workoutDocuments.runningWorkoutDocument) {
    return null;
  }

  function handleStartWorkout() {
    if (
      !exerciseLibrary.data ||
      !session.data ||
      workoutDocuments.runningWorkoutDocument
    ) {
      return;
    }

    const workoutExerciseIds = routine.exercises.map(() =>
      runtime.runSync(createIdentifier()),
    );
    const workoutId = runtime.runSync(createIdentifier());
    const startedAt = new Date().toISOString();

    workoutDocuments.dispatchWorkoutDocumentsAction({
      type: "startedWorkout",
      workoutDocument: buildWorkoutDocument({
        exercises: exerciseLibrary.data,
        routine,
        startedAt,
        userId: session.data.user.id,
        workoutExerciseIds,
        workoutId,
      }),
    });

    router.push("/workout");
  }

  return (
    <Button
      disabled={!canStartWorkout({ exerciseIds, routine })}
      onPress={handleStartWorkout}
      title={workoutStartButtonMessages.startWorkoutButton(routine.name)}
    />
  );
}
