export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const WEIGHT_UNITS = ["kilogram", "pound"] as const;

export const MINIMUM_WEIGHT = 0.01;

export const MAXIMUM_WEIGHT = 9999.99;

export const WEIGHT_STEP = 0.01;
