import { exerciseRouter } from "#/features/exercise/exercise-router.ts";
import { routineRouter } from "#/features/routine/routine-router.ts";
import { router } from "#/trpc/procedures.ts";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  exercise: exerciseRouter,
  routine: routineRouter,
});
