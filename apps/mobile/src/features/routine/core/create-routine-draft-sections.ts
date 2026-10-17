import type { Section } from "@ankaa/core/shared/constants/section";

import type { RoutineDraftBlock } from "@/features/routine/core/routine-draft-reducer";

export function createRoutineDraftSections(
  getRoutineDraftBlocks: (section: Section) => RoutineDraftBlock[],
) {
  return {
    cool_down: getRoutineDraftBlocks("cool_down"),
    main: getRoutineDraftBlocks("main"),
    warm_up: getRoutineDraftBlocks("warm_up"),
  } satisfies Record<Section, RoutineDraftBlock[]>;
}
