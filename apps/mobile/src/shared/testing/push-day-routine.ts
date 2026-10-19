import type { Routine } from "@/shared/interactors/list-routines";

export const pushDayRoutine: Routine = {
  days: ["monday"],
  exercises: [
    {
      exerciseId: "01900000-0000-7000-8000-000000000001",
      id: "01900000-0000-7000-8000-000000000002",
      note: null,
      position: 0,
      section: "main",
      sets: [
        {
          amount: 8,
          dropSetSegmentCount: null,
          dropSetWeightPercentage: null,
          id: "01900000-0000-7000-8000-000000000003",
          isToFailure: false,
          position: 0,
          restPauseRestSeconds: null,
          restPauseSegmentCount: null,
          restSeconds: 120,
          setType: "working",
          tempo: null,
          variation: null,
        },
      ],
      superset: null,
      warmUpForRoutineExerciseId: null,
    },
  ],
  id: "01900000-0000-7000-8000-000000000004",
  name: "Push day",
};
