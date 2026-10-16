import * as Data from "effect/Data";

type DecideRoutineSaveOptions = {
  routinesWithSameName: readonly unknown[];
  routineWithSameId: RoutineWithSameId | undefined;
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

const RoutineSaveOutcome = Data.taggedEnum<RoutineSaveOutcome>();

export function decideRoutineSave({
  routinesWithSameName,
  routineWithSameId,
  userId,
}: DecideRoutineSaveOptions) {
  if (routinesWithSameName.length > 0) {
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
