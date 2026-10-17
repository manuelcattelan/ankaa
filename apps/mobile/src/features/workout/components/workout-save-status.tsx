import { useWorkoutDocuments } from "@/features/workout/hooks/use-workout-documents";
import { workoutSaveStatusMessages } from "@/features/workout/messages/workout-save-status-messages";
import { StatusMessage } from "@/shared/components/status-message";

export function WorkoutSaveStatus() {
  const workoutDocuments = useWorkoutDocuments();

  return (
    <StatusMessage
      message={
        workoutDocuments.hasWorkoutSaveFailed
          ? workoutSaveStatusMessages.workoutSaveFailedStatus
          : undefined
      }
    />
  );
}
