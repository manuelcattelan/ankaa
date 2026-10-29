import { DeleteAccountButton } from "#/features/authentication/components/delete-account-button.tsx";
import { SignOutButton } from "#/features/authentication/components/sign-out-button.tsx";
import { Routines } from "#/features/routine/components/routines.tsx";
import { WorkoutResumeButton } from "#/features/workout/components/workout-resume-button.tsx";
import { WorkoutStartButton } from "#/features/workout/components/workout-start-button.tsx";
import { HomeScreen } from "#/shared/screens/home-screen.tsx";

export default function ApplicationRoute() {
  return (
    <HomeScreen>
      <WorkoutResumeButton />
      <Routines
        renderRoutineActions={(routine) => (
          <WorkoutStartButton
            routineId={routine.id}
            routineName={routine.name}
          />
        )}
      />
      <SignOutButton />
      <DeleteAccountButton />
    </HomeScreen>
  );
}
