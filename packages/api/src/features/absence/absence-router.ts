import { ABSENCE_RECORD_WIRE_ERRORS } from "@ankaa/core/features/absence/errors/absence-record-wire-errors";
import { absenceRecordInputSchema } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { AbsenceApplicationService } from "#/features/absence/absence-application-service.ts";
import { protectedProcedure, router } from "#/trpc/procedures.ts";
import { run } from "#/trpc/run.ts";

export const absenceRouter = router({
  record: protectedProcedure
    .input(Schema.toStandardSchemaV1(absenceRecordInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const absenceApplicationService = yield* AbsenceApplicationService;

          yield* absenceApplicationService.record({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: ABSENCE_RECORD_WIRE_ERRORS,
        signal,
      }),
    ),
});
