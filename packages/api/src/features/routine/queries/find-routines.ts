import type { DrizzleDatabase } from "@ankaa/database";

type FindRoutinesOptions = {
  database: DrizzleDatabase;
  userId: string;
};

export async function findRoutines({ database, userId }: FindRoutinesOptions) {
  return database.query.routine.findMany({
    columns: { id: true, name: true },
    orderBy: { name: "asc" },
    where: { deletedAt: { isNull: true }, userId },
    with: {
      routineDays: { columns: { dayOfWeek: true } },
      routineExercises: {
        columns: {
          exerciseId: true,
          id: true,
          note: true,
          position: true,
          section: true,
          superset: true,
          warmUpForRoutineExerciseId: true,
        },
        orderBy: { position: "asc" },
        with: {
          routineExerciseSets: {
            columns: {
              amount: true,
              dropSetSegmentCount: true,
              dropSetWeightPercentage: true,
              id: true,
              isToFailure: true,
              position: true,
              restPauseRestSeconds: true,
              restPauseSegmentCount: true,
              restSeconds: true,
              setType: true,
              tempo: true,
              variation: true,
            },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
}
