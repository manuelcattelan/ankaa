import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "@ankaa/core/features/routine/constants/drop-set";
import { MINIMUM_REST_SECONDS } from "@ankaa/core/features/routine/constants/minimum-rest-seconds";
import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { MINIMUM_AMOUNT } from "@ankaa/core/shared/constants/amount";
import { INTENSITY_TECHNIQUES } from "@ankaa/core/shared/constants/intensity-techniques";
import { MINIMUM_POSITION } from "@ankaa/core/shared/constants/minimum-position";
import { SECTIONS } from "@ankaa/core/shared/constants/sections";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { TEMPO_PATTERN } from "@ankaa/core/shared/constants/tempo-pattern";
import { between, gte, inArray, isNull, sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  snakeCase,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "#/schema/authentication.ts";
import { exercise } from "#/schema/exercise.ts";

export const routine = snakeCase.table(
  "routine",
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    name: text().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "routine_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("routine_user_id_name_idx")
      .on(table.userId, table.name)
      .where(isNull(table.deletedAt)),
    index("routine_user_id_idx").on(table.userId),
  ],
);

export const routineDay = snakeCase.table(
  "routine_day",
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    dayOfWeek: text({ enum: DAYS_OF_WEEK }).notNull(),
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "routine_day_routine_id_fkey",
        onDelete: "cascade",
      }),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    unique("routine_day_routine_id_day_of_week_key").on(
      table.routineId,
      table.dayOfWeek,
    ),
    check(
      "routine_day_day_of_week_check",
      inArray(table.dayOfWeek, DAYS_OF_WEEK),
    ),
  ],
);

export const routineExercise = snakeCase.table(
  "routine_exercise",
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "routine_exercise_exercise_id_fkey",
        onDelete: "restrict",
      }),
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    note: text(),
    position: integer().notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "routine_exercise_routine_id_fkey",
        onDelete: "cascade",
      }),
    section: text({ enum: SECTIONS }).notNull(),
    superset: integer(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    warmUpForRoutineExerciseId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.warmUpForRoutineExerciseId],
      foreignColumns: [table.id],
      name: "routine_exercise_warm_up_for_routine_exercise_id_fkey",
    }).onDelete("cascade"),
    unique("routine_exercise_routine_id_position_key").on(
      table.routineId,
      table.position,
    ),
    index("routine_exercise_exercise_id_idx").on(table.exerciseId),
    index("routine_exercise_warm_up_for_routine_exercise_id_idx").on(
      table.warmUpForRoutineExerciseId,
    ),
    check("routine_exercise_section_check", inArray(table.section, SECTIONS)),
    check(
      "routine_exercise_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
  ],
);

export const routineExerciseSet = snakeCase.table(
  "routine_exercise_set",
  {
    amount: integer(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    dropSetSegmentCount: integer(),
    dropSetWeightPercentage: integer(),
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    isToFailure: boolean().notNull().default(false),
    position: integer().notNull(),
    restPauseRestSeconds: integer(),
    restPauseSegmentCount: integer(),
    restSeconds: integer(),
    routineExerciseId: uuid()
      .notNull()
      .references(() => routineExercise.id, {
        name: "routine_exercise_set_routine_exercise_id_fkey",
        onDelete: "cascade",
      }),
    setType: text({ enum: SET_TYPES }).notNull(),
    tempo: text(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    variation: text({ enum: INTENSITY_TECHNIQUES }),
  },
  (table) => [
    unique("routine_exercise_set_routine_exercise_id_position_key").on(
      table.routineExerciseId,
      table.position,
    ),
    check(
      "routine_exercise_set_set_type_check",
      inArray(table.setType, SET_TYPES),
    ),
    check(
      "routine_exercise_set_variation_check",
      inArray(table.variation, INTENSITY_TECHNIQUES),
    ),
    check(
      "routine_exercise_set_tempo_check",
      sql`${table.tempo} ~ ${TEMPO_PATTERN.source}`,
    ),
    check(
      "routine_exercise_set_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "routine_exercise_set_amount_check",
      gte(table.amount, MINIMUM_AMOUNT),
    ),
    check(
      "routine_exercise_set_rest_seconds_check",
      gte(table.restSeconds, MINIMUM_REST_SECONDS),
    ),
    check(
      "routine_exercise_set_rest_pause_rest_seconds_check",
      gte(table.restPauseRestSeconds, MINIMUM_REST_SECONDS),
    ),
    check(
      "routine_exercise_set_rest_pause_segment_count_check",
      gte(table.restPauseSegmentCount, MINIMUM_SEGMENT_COUNT),
    ),
    check(
      "routine_exercise_set_drop_set_segment_count_check",
      gte(table.dropSetSegmentCount, MINIMUM_SEGMENT_COUNT),
    ),
    check(
      "routine_exercise_set_drop_set_weight_percentage_check",
      between(
        table.dropSetWeightPercentage,
        MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
        MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
      ),
    ),
    check(
      "routine_exercise_set_rest_pause_check",
      sql`case when ${table.variation} = 'rest_pause' then ${table.restPauseRestSeconds} is not null and ${table.restPauseSegmentCount} is not null else ${table.restPauseRestSeconds} is null and ${table.restPauseSegmentCount} is null end`,
    ),
    check(
      "routine_exercise_set_drop_set_check",
      sql`case when ${table.variation} = 'drop_set' then ${table.dropSetSegmentCount} is not null else ${table.dropSetSegmentCount} is null and ${table.dropSetWeightPercentage} is null end`,
    ),
  ],
);
