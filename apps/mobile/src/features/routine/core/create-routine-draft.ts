import * as Schema from "effect/Schema";

import type { RoutineDraft } from "#/features/routine/core/routine-form-schema.ts";
import type { Routine } from "#/shared/routine.ts";

import { routineFormSchema } from "#/features/routine/core/routine-form-schema.ts";

const encodeRoutine = Schema.encodeSync(routineFormSchema);

const NEW_ROUTINE_DRAFT: RoutineDraft = {
  days: [],
  id: "",
  name: "",
  sections: { coolDown: [], main: [], warmUp: [] },
};

/**
 * Creates the Draft that the editor opens with: the encoded Routine, or an
 * empty Draft whose id the first Save assigns.
 */
export function createRoutineDraft(routine: null | Routine) {
  return routine === null ? NEW_ROUTINE_DRAFT : encodeRoutine(routine);
}
