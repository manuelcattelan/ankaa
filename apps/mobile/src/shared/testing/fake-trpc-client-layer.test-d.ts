import type { FakeTrpcProcedures } from "#/shared/testing/fake-trpc-client-layer.ts";

describe("FakeTrpcProcedures", () => {
  it("rejects a record of fake procedures that misses a procedure of AppRouter", () => {
    // @ts-expect-error -- the record misses exercise.list
    ({}) satisfies FakeTrpcProcedures;
  });
});
