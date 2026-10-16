import { createContext } from "react";

import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";
import type { WorkoutDocumentsAction } from "@/features/workout/core/workout-documents-reducer";

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
