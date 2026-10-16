import type { RoutineDraftBlock } from "@/features/routine/core/routine-draft-reducer";

type JoinRoutineDraftBlockWithNextBlockOptions = {
  routineDraftBlockId: string;
  routineDraftBlocks: RoutineDraftBlock[];
};

export function joinRoutineDraftBlockWithNextBlock({
  routineDraftBlockId,
  routineDraftBlocks,
}: JoinRoutineDraftBlockWithNextBlockOptions) {
  const routineDraftBlockIndex = routineDraftBlocks.findIndex(
    (routineDraftBlock) => routineDraftBlock.id === routineDraftBlockId,
  );
  const nextRoutineDraftBlockIndex = routineDraftBlockIndex + 1;
  const routineDraftBlock = routineDraftBlocks.at(routineDraftBlockIndex);
  const nextRoutineDraftBlock = routineDraftBlocks.at(
    nextRoutineDraftBlockIndex,
  );

  if (
    routineDraftBlockIndex < 0 ||
    !routineDraftBlock ||
    !nextRoutineDraftBlock
  ) {
    return routineDraftBlocks;
  }

  return [
    ...routineDraftBlocks.slice(0, routineDraftBlockIndex),
    {
      exercises: [
        ...routineDraftBlock.exercises,
        ...nextRoutineDraftBlock.exercises,
      ],
      id: routineDraftBlock.id,
      warmUpExercises: [
        ...routineDraftBlock.warmUpExercises,
        ...nextRoutineDraftBlock.warmUpExercises,
      ],
    },
    ...routineDraftBlocks.slice(nextRoutineDraftBlockIndex + 1),
  ];
}
