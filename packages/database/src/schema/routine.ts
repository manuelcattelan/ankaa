import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import {} from "@ankaa/core/features/routine/constants/drop-set";
import {} from "@ankaa/core/shared/constants/intensity-techniques";
import { MINIMUM_POSITION } from "@ankaa/core/shared/constants/minimum-position";
import { SECTIONS } from "@ankaa/core/shared/constants/sections";
import { gte, inArray, isNull, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  snakeCase,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { buildPlannedSetChecks } from "#/columns/build-planned-set-checks.ts";
import { plannedSetColumns } from "#/columns/planned-set-columns.ts";
import { timestamps } from "#/columns/timestamps.ts";
import { user } from "#/schema/authentication.ts";
import { exercise } from "#/schema/exercise.ts";

const TRIMMED_TEXT_PATTERN = String.raw`^\S(.*\S)?$`;

export const routine = snakeCase.table(
  "routine",
  {
    ...timestamps,
    deletedAt: timestamp({ withTimezone: true }),
    id: uuid().notNull(),
    name: text().notNull(),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "routine_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "routine_pkey" }),
    uniqueIndex("routine_live_name_idx")
      .on(table.userId, sql`lower(${table.name})`)
      .where(isNull(table.deletedAt)),
    index("routine_user_id_idx").on(table.userId),
    // The wire Schema trims a Routine name and requires it non-empty, so the
    // name starts and ends with a character that isn't whitespace.
    check("routine_name_check", sql`${table.name} ~ ${TRIMMED_TEXT_PATTERN}`),
  ],
);

export const routineDay = snakeCase.table(
  "routine_day",
  {
    dayOfWeek: text({ enum: DAYS_OF_WEEK }).notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "routine_day_routine_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.routineId, table.dayOfWeek],
      name: "routine_day_pkey",
    }),
    check(
      "routine_day_day_of_week_check",
      inArray(table.dayOfWeek, DAYS_OF_WEEK),
    ),
  ],
);

export const routineExerciseGroup = snakeCase.table(
  "routine_exercise_group",
  {
    id: uuid().notNull(),
    position: integer().notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "routine_exercise_group_routine_id_fkey",
        onDelete: "cascade",
      }),
    section: text({ enum: SECTIONS }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "routine_exercise_group_pkey" }),
    unique("routine_exercise_group_routine_id_section_position_key").on(
      table.routineId,
      table.section,
      table.position,
    ),
    check(
      "routine_exercise_group_section_check",
      inArray(table.section, SECTIONS),
    ),
    check(
      "routine_exercise_group_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
  ],
);

export const routineExercise = snakeCase.table(
  "routine_exercise",
  {
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "routine_exercise_exercise_id_fkey",
        onDelete: "restrict",
      }),
    id: uuid().notNull(),
    note: text(),
    position: integer().notNull(),
    routineExerciseGroupId: uuid().references(() => routineExerciseGroup.id, {
      name: "routine_exercise_routine_exercise_group_id_fkey",
      onDelete: "cascade",
    }),
    warmUpForRoutineExerciseId: uuid(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "routine_exercise_pkey" }),
    foreignKey({
      columns: [table.warmUpForRoutineExerciseId],
      foreignColumns: [table.id],
      name: "routine_exercise_warm_up_for_routine_exercise_id_fkey",
    }).onDelete("cascade"),
    unique("routine_exercise_routine_exercise_group_id_position_key").on(
      table.routineExerciseGroupId,
      table.position,
    ),
    unique("routine_exercise_warm_up_for_routine_exercise_id_position_key").on(
      table.warmUpForRoutineExerciseId,
      table.position,
    ),
    index("routine_exercise_exercise_id_idx").on(table.exerciseId),
    check(
      "routine_exercise_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "routine_exercise_parent_check",
      sql`num_nonnulls(${table.routineExerciseGroupId}, ${table.warmUpForRoutineExerciseId}) = 1`,
    ),
  ],
);

export const routineExerciseSet = snakeCase.table(
  "routine_exercise_set",
  {
    ...plannedSetColumns,
    id: uuid().notNull(),
    position: integer().notNull(),
    routineExerciseId: uuid()
      .notNull()
      .references(() => routineExercise.id, {
        name: "routine_exercise_set_routine_exercise_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "routine_exercise_set_pkey" }),
    unique("routine_exercise_set_routine_exercise_id_position_key").on(
      table.routineExerciseId,
      table.position,
    ),
    check(
      "routine_exercise_set_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    ...buildPlannedSetChecks({ name: "routine_exercise_set", table }),
  ],
);
