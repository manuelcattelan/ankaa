import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { inferRouterOutputs } from "@trpc/server";

export type Workout = NonNullable<
  inferRouterOutputs<AppRouter>["workout"]["findInProgress"]
>;
