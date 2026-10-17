import { use } from "react";

import { WorkoutDocumentsContext } from "@/features/workout/providers/workout-documents-context";

export function useWorkoutDocuments() {
  const workoutDocumentsContextValue = use(WorkoutDocumentsContext);

  if (!workoutDocumentsContextValue) {
    throw new Error(
      "useWorkoutDocuments must be called inside WorkoutDocumentsProvider",
    );
  }

  return workoutDocumentsContextValue;
}
