import { appRouter } from "#/trpc/app-router.ts";
import { createCallerFactory } from "#/trpc/procedures.ts";

export const createCaller = createCallerFactory(appRouter);
