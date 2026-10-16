import { useLocalSearchParams } from "expo-router";

import { ExercisePicker } from "@/features/exercise/components/exercise-picker";
import { EditRoutineScreen } from "@/features/routine/screens/edit-routine-screen";

type RoutineIdSearchParameters = {
  routineId: string;
};

export default function RoutineIdRoute() {
  const searchParameters = useLocalSearchParams<RoutineIdSearchParameters>();

  return (
    <EditRoutineScreen
      renderExercisePicker={(onSelectExercise) => (
        <ExercisePicker onSelectExercise={onSelectExercise} />
      )}
      routineId={searchParameters.routineId}
    />
  );
}
