import { SignOutButton } from "#/features/authentication/components/sign-out-button.tsx";
import { Routines } from "#/features/routine/components/routines.tsx";
import { HomeScreen } from "#/shared/screens/home-screen.tsx";

export default function ApplicationRoute() {
  return (
    <HomeScreen>
      <Routines />
      <SignOutButton />
    </HomeScreen>
  );
}
