import { useLocalSearchParams } from "expo-router";

import { ExercisePicker } from "#/features/exercise/components/exercise-picker.tsx";
import { RoutineScreen } from "#/features/routine/screens/routine-screen.tsx";

type RoutineIdSearchParameters = {
  routineId: string;
};

export default function RoutineIdRoute() {
  const searchParameters = useLocalSearchParams<RoutineIdSearchParameters>();

  return (
    <RoutineScreen
      renderExercisePicker={(onSelectExercise) => (
        <ExercisePicker onSelectExercise={onSelectExercise} />
      )}
      routineId={searchParameters.routineId}
    />
  );
}
