import * as Data from "effect/Data";

type DecideRoutineDeleteOptions = {
  routine: Routine | undefined;
};

type Routine = {
  readonly id: string;
};

type RoutineDeleteOutcome = Data.TaggedEnum<{
  RoutineDeleteAllowed: object;
  RoutineNotFound: object;
}>;

const RoutineDeleteOutcome = Data.taggedEnum<RoutineDeleteOutcome>();

export function decideRoutineDelete({ routine }: DecideRoutineDeleteOptions) {
  return routine === undefined
    ? RoutineDeleteOutcome.RoutineNotFound()
    : RoutineDeleteOutcome.RoutineDeleteAllowed();
}
