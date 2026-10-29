import { SignOutButton } from "#/features/authentication/components/sign-out-button.tsx";
import { HomeScreen } from "#/shared/screens/home-screen.tsx";

export default function ApplicationRoute() {
  return (
    <HomeScreen>
      <SignOutButton />
    </HomeScreen>
  );
}
