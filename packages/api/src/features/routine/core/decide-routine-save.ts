import * as Data from "effect/Data";

type DecideRoutineSaveOptions = {
  routineWithSameId: RoutineWithSameId | undefined;
  routineWithSameName: RoutineWithSameName | undefined;
  userId: string;
};

type RoutineSaveOutcome = Data.TaggedEnum<{
  RoutineNameConflict: object;
  RoutineNotFound: object;
  RoutineSaveAllowed: object;
}>;

type RoutineWithSameId = {
  readonly deletedAt: Date | null;
  readonly userId: string;
};

type RoutineWithSameName = {
  readonly id: string;
};

const RoutineSaveOutcome = Data.taggedEnum<RoutineSaveOutcome>();

export function decideRoutineSave({
  routineWithSameId,
  routineWithSameName,
  userId,
}: DecideRoutineSaveOptions) {
  if (routineWithSameName !== undefined) {
    return RoutineSaveOutcome.RoutineNameConflict();
  }

  if (
    routineWithSameId !== undefined &&
    (routineWithSameId.userId !== userId ||
      routineWithSameId.deletedAt instanceof Date)
  ) {
    return RoutineSaveOutcome.RoutineNotFound();
  }

  return RoutineSaveOutcome.RoutineSaveAllowed();
}
