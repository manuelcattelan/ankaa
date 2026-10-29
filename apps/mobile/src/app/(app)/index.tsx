import { SignOutButton } from "@/features/authentication/components/sign-out-button";
import { HomeScreen } from "@/shared/screens/home-screen";

export default function AppRoute() {
  return (
    <HomeScreen>
      <SignOutButton />
    </HomeScreen>
  );
}
