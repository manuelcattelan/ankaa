import { SignOutButton } from "@/features/authentication/components/sign-out-button";
import { RoutineList } from "@/features/routine/components/routine-list";
import { WorkoutResumeButton } from "@/features/workout/components/workout-resume-button";
import { WorkoutSaveStatus } from "@/features/workout/components/workout-save-status";
import { WorkoutStartButton } from "@/features/workout/components/workout-start-button";
import { HomeScreen } from "@/shared/screens/home-screen";

export default function AppRoute() {
  return (
    <HomeScreen>
      <WorkoutResumeButton />
      <RoutineList
        renderRoutineActions={(routine) => (
          <WorkoutStartButton routine={routine} />
        )}
      >
        <WorkoutSaveStatus />
      </RoutineList>
      <SignOutButton />
    </HomeScreen>
  );
}
