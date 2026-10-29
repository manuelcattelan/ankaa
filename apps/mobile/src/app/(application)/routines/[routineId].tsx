import { useLocalSearchParams } from "expo-router";

import { RoutineScreen } from "#/features/routine/screens/routine-screen.tsx";

type RoutineIdSearchParameters = {
  routineId: string;
};

export default function RoutineIdRoute() {
  const searchParameters = useLocalSearchParams<RoutineIdSearchParameters>();

  return <RoutineScreen routineId={searchParameters.routineId} />;
}
