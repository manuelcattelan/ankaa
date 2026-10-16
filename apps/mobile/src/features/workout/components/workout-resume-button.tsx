import { useWorkoutDocuments } from "@/features/workout/hooks/use-workout-documents";
import { workoutResumeButtonMessages } from "@/features/workout/messages/workout-resume-button-messages";
import { LinkButton } from "@/shared/components/link-button";

export function WorkoutResumeButton() {
  const workoutDocuments = useWorkoutDocuments();

  if (!workoutDocuments.runningWorkoutDocument) {
    return null;
  }

  return (
    <LinkButton
      href="/workout"
      title={workoutResumeButtonMessages.resumeWorkoutButton}
    />
  );
}
