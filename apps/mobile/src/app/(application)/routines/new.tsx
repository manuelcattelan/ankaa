import { ExercisePicker } from "#/features/exercise/components/exercise-picker.tsx";
import { NewRoutineScreen } from "#/features/routine/screens/new-routine-screen.tsx";

export default function NewRoutineRoute() {
  return (
    <NewRoutineScreen
      renderExercisePicker={(onSelectExercise) => (
        <ExercisePicker onSelectExercise={onSelectExercise} />
      )}
    />
  );
}
