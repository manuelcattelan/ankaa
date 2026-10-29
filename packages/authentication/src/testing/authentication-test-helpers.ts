import type { TestHelpers } from "better-auth/plugins";

import * as Context from "effect/Context";

export class AuthenticationTestHelpers extends Context.Service<
  AuthenticationTestHelpers,
  TestHelpers
>()("@ankaa/authentication/testing/AuthenticationTestHelpers") {}
