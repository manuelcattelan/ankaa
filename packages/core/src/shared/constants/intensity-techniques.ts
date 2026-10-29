export type IntensityTechnique = (typeof INTENSITY_TECHNIQUES)[number];

export const DROP_SET = "drop_set";

export const REST_PAUSE_SET = "rest_pause_set";

export const INTENSITY_TECHNIQUES = [DROP_SET, REST_PAUSE_SET] as const;
