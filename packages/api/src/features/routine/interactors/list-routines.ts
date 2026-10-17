import { CurrentSession } from "@ankaa/authentication/current-session";
import { Database } from "@ankaa/database";
import * as Effect from "effect/Effect";

import { buildRoutineList } from "../core/build-routine-list.ts";
import { findRoutines } from "../queries/find-routines.ts";

export const listRoutines = Effect.fn("listRoutines")(function* () {
  const database = yield* Database;
  const currentSession = yield* CurrentSession;

  const routines = yield* database.query((drizzleDatabase) =>
    findRoutines({
      database: drizzleDatabase,
      userId: currentSession.user.id,
    }),
  );

  return buildRoutineList(routines);
});
