export type IntensityTechnique = (typeof INTENSITY_TECHNIQUES)[number];

export const DROP_SET = "drop_set";

export const REST_PAUSE_SET = "rest_pause_set";

export const INTENSITY_TECHNIQUES = [DROP_SET, REST_PAUSE_SET] as const;

/**
 * The value of each Intensity technique by the tag that the wire Schema
 * gives it.
 */
export const INTENSITY_TECHNIQUE_VALUES = {
  DropSet: DROP_SET,
  RestPauseSet: REST_PAUSE_SET,
} as const satisfies Record<string, IntensityTechnique>;
