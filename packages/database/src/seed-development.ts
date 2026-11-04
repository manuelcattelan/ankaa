import * as Effect from "effect/Effect";

import { Database } from "#/database.ts";
import { seed } from "#/seed.ts";

await Effect.runPromise(seed.pipe(Effect.provide(Database.layerDirect)));
