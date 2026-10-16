import type {
  RoutineDraftBlock,
  RoutineDraftBlockMoveDirection,
} from "@/features/routine/core/routine-draft-reducer";

type MoveRoutineDraftBlockOptions = {
  routineDraftBlockId: string;
  routineDraftBlockMoveDirection: RoutineDraftBlockMoveDirection;
  routineDraftBlocks: RoutineDraftBlock[];
};

export function moveRoutineDraftBlock({
  routineDraftBlockId,
  routineDraftBlockMoveDirection,
  routineDraftBlocks,
}: MoveRoutineDraftBlockOptions) {
  const routineDraftBlockIndex = routineDraftBlocks.findIndex(
    (routineDraftBlock) => routineDraftBlock.id === routineDraftBlockId,
  );
  const neighborRoutineDraftBlockIndex =
    routineDraftBlockMoveDirection === "up"
      ? routineDraftBlockIndex - 1
      : routineDraftBlockIndex + 1;
  const routineDraftBlock = routineDraftBlocks.at(routineDraftBlockIndex);
  const neighborRoutineDraftBlock = routineDraftBlocks.at(
    neighborRoutineDraftBlockIndex,
  );

  if (
    routineDraftBlockIndex < 0 ||
    neighborRoutineDraftBlockIndex < 0 ||
    !routineDraftBlock ||
    !neighborRoutineDraftBlock
  ) {
    return routineDraftBlocks;
  }

  const movedRoutineDraftBlocks = [...routineDraftBlocks];

  movedRoutineDraftBlocks[routineDraftBlockIndex] = neighborRoutineDraftBlock;
  movedRoutineDraftBlocks[neighborRoutineDraftBlockIndex] = routineDraftBlock;

  return movedRoutineDraftBlocks;
}
