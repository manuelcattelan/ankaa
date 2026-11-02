import type { plannedSetColumns } from "@ankaa/database/columns/planned-set-columns";

/**
 * Selects every column of a planned Set in a relational query. The
 * `satisfies` makes a column of `plannedSetColumns` missing from it fail to
 * compile, instead of silently dropping a field.
 */
export const PLANNED_SET_COLUMNS = {
  amount: true,
  intensityTechnique: true,
  isToFailure: true,
  pauseSeconds: true,
  restSeconds: true,
  segmentCount: true,
  tempo: true,
  type: true,
  weightPercentage: true,
} as const satisfies Record<keyof typeof plannedSetColumns, true>;
