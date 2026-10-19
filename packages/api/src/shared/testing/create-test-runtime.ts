import { Authentication } from "@ankaa/authentication";
import { Database } from "@ankaa/database";
import { Email } from "@ankaa/email";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

export function createTestRuntime(testDatabaseUrl: string) {
  return ManagedRuntime.make(
    Authentication.layerNoDeps.pipe(
      Layer.provideMerge(Database.layer),
      Layer.provide(Email.layerTest([])),
      Layer.provideMerge(
        ConfigProvider.layerAdd(
          ConfigProvider.fromUnknown({ DATABASE_URL: testDatabaseUrl }),
          { asPrimary: true },
        ),
      ),
    ),
  );
}
