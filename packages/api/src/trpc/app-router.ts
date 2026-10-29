import { exerciseRouter } from "#/features/exercise/exercise-router.ts";
import { router } from "#/trpc/procedures.ts";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  exercise: exerciseRouter,
});
