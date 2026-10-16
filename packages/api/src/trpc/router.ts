import { exerciseRouter } from "../features/exercise/router.ts";
import { routineRouter } from "../features/routine/router.ts";
import { workoutRouter } from "../features/workout/router.ts";
import { router } from "./procedures.ts";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  exercise: exerciseRouter,
  routine: routineRouter,
  workout: workoutRouter,
});
