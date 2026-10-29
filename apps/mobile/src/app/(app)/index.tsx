import { SignOutButton } from "#/features/authentication/components/sign-out-button.tsx";
import { HomeScreen } from "#/shared/screens/home-screen.tsx";

export default function AppRoute() {
  return (
    <HomeScreen>
      <SignOutButton />
    </HomeScreen>
  );
}
