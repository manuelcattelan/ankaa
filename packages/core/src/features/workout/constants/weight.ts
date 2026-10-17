export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const WEIGHT_UNITS = ["kilogram", "pound"] as const;

export const WEIGHT_VALUE_MINIMUM = 0.01;

export const WEIGHT_VALUE_MAXIMUM = 9_999.99;

export const WEIGHT_VALUE_STEP = 0.01;
