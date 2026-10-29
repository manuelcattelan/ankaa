import type { AnyPgColumn } from "drizzle-orm/pg-core";

import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "@ankaa/core/features/routine/constants/drop-set";
import { MINIMUM_PAUSE_SECONDS } from "@ankaa/core/features/routine/constants/minimum-pause-seconds";
import { MINIMUM_REST_SECONDS } from "@ankaa/core/features/routine/constants/minimum-rest-seconds";
import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { MINIMUM_AMOUNT } from "@ankaa/core/shared/constants/amount";
import {
  DROP_SET,
  INTENSITY_TECHNIQUES,
  REST_PAUSE_SET,
} from "@ankaa/core/shared/constants/intensity-techniques";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { TEMPO_PATTERN } from "@ankaa/core/shared/constants/tempo-pattern";
import { between, gte, inArray, sql } from "drizzle-orm";
import { check } from "drizzle-orm/pg-core";

type PlannedSetTable = Record<
  | "amount"
  | "intensityTechnique"
  | "pauseSeconds"
  | "restSeconds"
  | "segmentCount"
  | "tempo"
  | "type"
  | "weightPercentage",
  AnyPgColumn
>;

/**
 * Builds the CHECKs of the planned Set columns of `table`, named after its
 * SQL name `name`, so the Routine's Sets and a Workout's copy of them hold
 * the same single-row rules.
 */
export function buildPlannedSetChecks({
  name,
  table,
}: {
  name: string;
  table: PlannedSetTable;
}) {
  return [
    check(`${name}_type_check`, inArray(table.type, SET_TYPES)),
    check(
      `${name}_intensity_technique_check`,
      inArray(table.intensityTechnique, INTENSITY_TECHNIQUES),
    ),
    check(`${name}_tempo_check`, sql`${table.tempo} ~ ${TEMPO_PATTERN.source}`),
    check(`${name}_amount_check`, gte(table.amount, MINIMUM_AMOUNT)),
    check(
      `${name}_rest_seconds_check`,
      gte(table.restSeconds, MINIMUM_REST_SECONDS),
    ),
    check(
      `${name}_segment_count_check`,
      gte(table.segmentCount, MINIMUM_SEGMENT_COUNT),
    ),
    check(
      `${name}_weight_percentage_check`,
      between(
        table.weightPercentage,
        MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
        MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
      ),
    ),
    check(
      `${name}_pause_seconds_check`,
      gte(table.pauseSeconds, MINIMUM_PAUSE_SECONDS),
    ),
    check(
      `${name}_no_intensity_technique_check`,
      sql`${table.intensityTechnique} is not null or (${table.segmentCount} is null and ${table.weightPercentage} is null and ${table.pauseSeconds} is null)`,
    ),
    check(
      `${name}_drop_set_check`,
      sql`${table.intensityTechnique} <> ${DROP_SET} or (${table.segmentCount} is not null and ${table.pauseSeconds} is null)`,
    ),
    check(
      `${name}_rest_pause_set_check`,
      sql`${table.intensityTechnique} <> ${REST_PAUSE_SET} or (${table.segmentCount} is not null and ${table.pauseSeconds} is not null and ${table.weightPercentage} is null)`,
    ),
  ];
}
