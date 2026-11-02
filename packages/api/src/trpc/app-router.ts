import { absenceRouter } from "#/features/absence/absence-router.ts";
import { exerciseRouter } from "#/features/exercise/exercise-router.ts";
import { routineRouter } from "#/features/routine/routine-router.ts";
import { workoutRouter } from "#/features/workout/workout-router.ts";
import { router } from "#/trpc/procedures.ts";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  absence: absenceRouter,
  exercise: exerciseRouter,
  routine: routineRouter,
  workout: workoutRouter,
});
