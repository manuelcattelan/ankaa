import { getAuthTables } from "better-auth/db";
import { describe, expect, it } from "vitest";

import { placeholderAuthenticationOptions } from "#/placeholder-authentication-options.ts";
import { listTableMismatches } from "#/testing/list-table-mismatches.ts";

const models = getAuthTables(placeholderAuthenticationOptions);

describe("createAuthenticationOptions", () => {
  it.for(Object.values(models))(
    "gives the $modelName model a Drizzle table whose columns match its fields",
    (model) => {
      expect(listTableMismatches(model)).toStrictEqual([]);
    },
  );
});
