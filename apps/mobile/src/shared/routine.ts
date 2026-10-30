import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { inferRouterOutputs } from "@trpc/server";

export type Routine = inferRouterOutputs<AppRouter>["routine"]["list"][number];
