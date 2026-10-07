import { exerciseRouter } from "./routers/exercise.ts";
import { router } from "./trpc.ts";

export type AppRouter = typeof appRouter;
export const appRouter = router({ exercise: exerciseRouter });
