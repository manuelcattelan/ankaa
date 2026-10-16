import type * as Effect from "effect/Effect";

import * as Context from "effect/Context";

import type { Authentication } from "./index.ts";

type CurrentSessionShape = NonNullable<
  Effect.Success<ReturnType<Authentication["Service"]["getSession"]>>
>;

export class CurrentSession extends Context.Service<
  CurrentSession,
  CurrentSessionShape
>()("@ankaa/authentication/CurrentSession") {}
