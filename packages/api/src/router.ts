import { exerciseRouter } from "./routers/exercise.ts";
import { routineRouter } from "./routers/routine.ts";
import { workoutRouter } from "./routers/workout.ts";
import { router } from "./trpc.ts";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  exercise: exerciseRouter,
  routine: routineRouter,
  workout: workoutRouter,
});
