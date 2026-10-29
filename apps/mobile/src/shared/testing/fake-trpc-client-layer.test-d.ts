import { initTRPC } from "@trpc/server";

import type { FakeTrpcProcedures } from "#/shared/testing/fake-trpc-client-layer.ts";

describe("FakeTrpcProcedures", () => {
  it("rejects a record of fake procedures that misses a procedure of AppRouter", () => {
    // @ts-expect-error -- the record misses exercise.list
    ({}) satisfies FakeTrpcProcedures;
  });

  it("rejects a fake procedure that doesn't take the input of its procedure of AppRouter", () => {
    const t = initTRPC.create();

    ({
      "exercise.list": t.procedure.query(() => []),
      // @ts-expect-error -- routine.delete takes the id of the Routine to delete
      "routine.delete": t.procedure.mutation(() => null),
      "routine.list": t.procedure.query(() => []),
    }) satisfies FakeTrpcProcedures;
  });
});
