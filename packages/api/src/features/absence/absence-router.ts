import { ABSENCE_EDIT_WIRE_ERRORS } from "@ankaa/core/features/absence/errors/absence-edit-wire-errors";
import { ABSENCE_RECORD_WIRE_ERRORS } from "@ankaa/core/features/absence/errors/absence-record-wire-errors";
import { ABSENCE_REMOVE_WIRE_ERRORS } from "@ankaa/core/features/absence/errors/absence-remove-wire-errors";
import { absenceEditInputSchema } from "@ankaa/core/features/absence/schemas/absence-edit-input-schema";
import { absenceRecordInputSchema } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import { absenceRemoveInputSchema } from "@ankaa/core/features/absence/schemas/absence-remove-input-schema";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import { AbsenceApplicationService } from "#/features/absence/absence-application-service.ts";
import { protectedProcedure, router } from "#/trpc/procedures.ts";
import { run } from "#/trpc/run.ts";

export const absenceRouter = router({
  edit: protectedProcedure
    .input(Schema.toStandardSchemaV1(absenceEditInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const absenceApplicationService = yield* AbsenceApplicationService;

          yield* absenceApplicationService.edit({
            input,
            userId: ctx.session.user.id,
          });
        }),
        errors: ABSENCE_EDIT_WIRE_ERRORS,
        signal,
      }),
    ),
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
  remove: protectedProcedure
    .input(Schema.toStandardSchemaV1(absenceRemoveInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: Effect.gen(function* () {
          const absenceApplicationService = yield* AbsenceApplicationService;

          yield* absenceApplicationService.remove({
            id: input.id,
            userId: ctx.session.user.id,
          });
        }),
        errors: ABSENCE_REMOVE_WIRE_ERRORS,
        signal,
      }),
    ),
});
