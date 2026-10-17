import { ExercisePicker } from "@/features/exercise/components/exercise-picker";
import { NewRoutineScreen } from "@/features/routine/screens/new-routine-screen";

export default function NewRoute() {
  return (
    <NewRoutineScreen
      renderExercisePicker={(onSelectExercise) => (
        <ExercisePicker onSelectExercise={onSelectExercise} />
      )}
    />
  );
}
