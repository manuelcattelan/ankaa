export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const WEIGHT_UNITS = ["kilogram", "pound"] as const;

export const MINIMUM_WEIGHT = 0.01;

export const MAXIMUM_WEIGHT = 9999.99;

export const WEIGHT_STEP = 0.01;

/**
 * The digits of a stored weight, and those after its decimal point, which
 * hold every weight from `MINIMUM_WEIGHT` to `MAXIMUM_WEIGHT` in steps of
 * `WEIGHT_STEP`.
 */
export const WEIGHT_PRECISION = 6;

export const WEIGHT_SCALE = 2;
