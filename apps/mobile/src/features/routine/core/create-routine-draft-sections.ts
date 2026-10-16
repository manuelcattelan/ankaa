import type { Section } from "@ankaa/core/shared/constants/section";

import type { RoutineDraftBlock } from "@/features/routine/core/routine-draft-reducer";

import {
  MAIN_SECTION,
  WARM_UP_SECTION,
} from "@/features/routine/constants/section";

export function createRoutineDraftSections(
  getRoutineDraftBlocks: (section: Section) => RoutineDraftBlock[],
) {
  return {
    cool_down: getRoutineDraftBlocks("cool_down"),
    main: getRoutineDraftBlocks(MAIN_SECTION),
    warm_up: getRoutineDraftBlocks(WARM_UP_SECTION),
  } satisfies Record<Section, RoutineDraftBlock[]>;
}
