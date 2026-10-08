import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

import { useTrpc } from "@/clients/trpc";
import { RoutineEditor } from "@/components/routine-editor";

type RoutineIdSearchParameters = {
  routineId: string;
};

export default function RoutineIdScreen() {
  const searchParameters = useLocalSearchParams<RoutineIdSearchParameters>();

  const trpc = useTrpc();

  const routines = useQuery(trpc.routine.list.queryOptions());

  const routine = routines.data?.find(
    (cachedRoutine) => cachedRoutine.id === searchParameters.routineId,
  );

  if (routines.isPending) {
    return <ActivityIndicator />;
  }

  if (!routine) {
    return <Redirect href="/" />;
  }

  return <RoutineEditor routine={routine} />;
}
