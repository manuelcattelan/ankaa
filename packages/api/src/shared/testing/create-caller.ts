import { createCallerFactory } from "#/trpc/procedures.ts";
import { appRouter } from "#/trpc/router.ts";

export const createCaller = createCallerFactory(appRouter);
