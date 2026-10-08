import { defineRelationsPart, inArray, sql } from "drizzle-orm";
import {
  check,
  snakeCase,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  AMOUNT_UNITS,
  EQUIPMENT,
  MUSCLE_GROUP_ROLES,
  MUSCLE_GROUPS,
  WEIGHT_TYPES,
} from "../constants.ts";

const commonColumns = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const exercise = snakeCase.table(
  "exercise",
  {
    ...commonColumns,
    amountUnit: text({ enum: AMOUNT_UNITS }).notNull(),
    name: text().notNull().unique(),
    weightType: text({ enum: WEIGHT_TYPES }).notNull(),
  },
  (table) => [
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
    ...commonColumns,
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "exercise_muscle_group_exercise_id_fkey",
        onDelete: "restrict",
      }),
    muscleGroup: text({ enum: MUSCLE_GROUPS }).notNull(),
    muscleGroupRole: text({ enum: MUSCLE_GROUP_ROLES }).notNull(),
  },
  (table) => [
    unique("exercise_muscle_group_exercise_id_muscle_group_key").on(
      table.exerciseId,
      table.muscleGroup,
    ),
    check(
      "exercise_muscle_group_muscle_group_check",
      inArray(table.muscleGroup, MUSCLE_GROUPS),
    ),
    check(
      "exercise_muscle_group_muscle_group_role_check",
      inArray(table.muscleGroupRole, MUSCLE_GROUP_ROLES),
    ),
  ],
);

export const exerciseEquipment = snakeCase.table(
  "exercise_equipment",
  {
    ...commonColumns,
    equipment: text({ enum: EQUIPMENT }).notNull(),
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "exercise_equipment_exercise_id_fkey",
        onDelete: "restrict",
      }),
  },
  (table) => [
    unique("exercise_equipment_exercise_id_equipment_key").on(
      table.exerciseId,
      table.equipment,
    ),
    check(
      "exercise_equipment_equipment_check",
      inArray(table.equipment, EQUIPMENT),
    ),
  ],
);

export const exerciseRelations = defineRelationsPart(
  { exercise, exerciseEquipment, exerciseMuscleGroup },
  (relationsBuilder) => ({
    exercise: {
      exerciseEquipment: relationsBuilder.many.exerciseEquipment({
        from: relationsBuilder.exercise.id,
        to: relationsBuilder.exerciseEquipment.exerciseId,
      }),
      exerciseMuscleGroups: relationsBuilder.many.exerciseMuscleGroup({
        from: relationsBuilder.exercise.id,
        to: relationsBuilder.exerciseMuscleGroup.exerciseId,
      }),
    },
    exerciseEquipment: {
      exercise: relationsBuilder.one.exercise({
        from: relationsBuilder.exerciseEquipment.exerciseId,
        optional: false,
        to: relationsBuilder.exercise.id,
      }),
    },
    exerciseMuscleGroup: {
      exercise: relationsBuilder.one.exercise({
        from: relationsBuilder.exerciseMuscleGroup.exerciseId,
        optional: false,
        to: relationsBuilder.exercise.id,
      }),
    },
  }),
);
