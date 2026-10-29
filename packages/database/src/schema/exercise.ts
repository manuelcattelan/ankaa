import { EQUIPMENT } from "@ankaa/core/features/exercise/constants/equipment";
import {
  MUSCLE_GROUP_ROLES,
  MUSCLE_GROUPS,
} from "@ankaa/core/features/exercise/constants/muscle-group";
import { AMOUNT_UNITS } from "@ankaa/core/shared/constants/amount";
import { WEIGHT_TYPES } from "@ankaa/core/shared/constants/weight-types";
import { inArray, sql } from "drizzle-orm";
import {
  check,
  primaryKey,
  snakeCase,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const exercise = snakeCase.table(
  "exercise",
  {
    amountUnit: text({ enum: AMOUNT_UNITS }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    name: text().notNull().unique("exercise_name_key"),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    weightType: text({ enum: WEIGHT_TYPES }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "exercise_pkey" }),
    check(
      "exercise_amount_unit_check",
      inArray(table.amountUnit, AMOUNT_UNITS),
    ),
    check(
      "exercise_weight_type_check",
      inArray(table.weightType, WEIGHT_TYPES),
    ),
  ],
);

export const exerciseMuscleGroup = snakeCase.table(
  "exercise_muscle_group",
  {
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "exercise_muscle_group_exercise_id_fkey",
        onDelete: "cascade",
      }),
    muscleGroup: text({ enum: MUSCLE_GROUPS }).notNull(),
    role: text({ enum: MUSCLE_GROUP_ROLES }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.exerciseId, table.muscleGroup],
      name: "exercise_muscle_group_pkey",
    }),
    check(
      "exercise_muscle_group_muscle_group_check",
      inArray(table.muscleGroup, MUSCLE_GROUPS),
    ),
    check(
      "exercise_muscle_group_role_check",
      inArray(table.role, MUSCLE_GROUP_ROLES),
    ),
  ],
);

export const exerciseEquipment = snakeCase.table(
  "exercise_equipment",
  {
    equipment: text({ enum: EQUIPMENT }).notNull(),
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "exercise_equipment_exercise_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.exerciseId, table.equipment],
      name: "exercise_equipment_pkey",
    }),
    check(
      "exercise_equipment_equipment_check",
      inArray(table.equipment, EQUIPMENT),
    ),
  ],
);
