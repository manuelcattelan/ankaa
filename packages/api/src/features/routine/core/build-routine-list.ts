import type { DayOfWeek } from "@ankaa/core/features/routine/constants/day-of-week";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/day-of-week";

type RoutineDayRow = {
  dayOfWeek: DayOfWeek;
};

type RoutineExerciseRow<TRoutineExerciseSetRow> = {
  routineExerciseSets: TRoutineExerciseSetRow[];
};

type RoutineRow<TRoutineExerciseFields, TRoutineExerciseSetRow> = {
  id: string;
  name: string;
  routineDays: RoutineDayRow[];
  routineExercises: (RoutineExerciseRow<TRoutineExerciseSetRow> &
    TRoutineExerciseFields)[];
};

export function buildRoutineList<
  TRoutineExerciseFields,
  TRoutineExerciseSetRow,
>(routines: RoutineRow<TRoutineExerciseFields, TRoutineExerciseSetRow>[]) {
  return routines.map((routine) => ({
    days: routine.routineDays
      .map((routineDay) => routineDay.dayOfWeek)
      .toSorted(
        (firstDayOfWeek, secondDayOfWeek) =>
          DAYS_OF_WEEK.indexOf(firstDayOfWeek) -
          DAYS_OF_WEEK.indexOf(secondDayOfWeek),
      ),
    exercises: routine.routineExercises.map(
      ({ routineExerciseSets, ...routineExercise }) => ({
        ...routineExercise,
        sets: routineExerciseSets,
      }),
    ),
    id: routine.id,
    name: routine.name,
  }));
}
