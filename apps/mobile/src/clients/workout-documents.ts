import { createContext, use } from "react";

import type {
  WorkoutDocument,
  WorkoutDocumentsAction,
} from "@/utilities/workout-documents";

type WorkoutDocumentsContextValue = {
  dispatchWorkoutDocumentsAction: (
    workoutDocumentsAction: WorkoutDocumentsAction,
  ) => void;
  hasWorkoutSaveFailed: boolean;
  runningWorkoutDocument: undefined | WorkoutDocument;
};

export const WorkoutDocumentsContext = createContext<
  undefined | WorkoutDocumentsContextValue
>(undefined);

export function useWorkoutDocuments() {
  const workoutDocumentsContextValue = use(WorkoutDocumentsContext);

  if (!workoutDocumentsContextValue) {
    throw new Error(
      "useWorkoutDocuments must be called inside WorkoutDocumentsProvider",
    );
  }

  return workoutDocumentsContextValue;
}
