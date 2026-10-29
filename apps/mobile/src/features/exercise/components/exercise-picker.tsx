import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";

import type { Exercise } from "#/shared/exercise-application-service.ts";

import { ExercisePickerContent } from "#/features/exercise/components/exercise-picker-content.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { getTrpcErrorMessage } from "#/shared/core/get-trpc-error-message.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

export function ExercisePicker({
  onSelectExercise,
}: {
  onSelectExercise: (exercise: Exercise) => void;
}) {
  const runtime = useRuntime();

  const exerciseLibrary = useQuery(exerciseListQueryOptions(runtime));

  if (exerciseLibrary.isPending) {
    return <ActivityIndicator />;
  }

  if (exerciseLibrary.isError) {
    return (
      <StatusMessage message={getTrpcErrorMessage(exerciseLibrary.error)} />
    );
  }

  return (
    <ExercisePickerContent
      exercises={exerciseLibrary.data}
      onSelectExercise={onSelectExercise}
    />
  );
}
