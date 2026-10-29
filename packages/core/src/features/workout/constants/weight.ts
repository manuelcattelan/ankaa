export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const WEIGHT_UNITS = ["kilogram", "pound"] as const;

export const MINIMUM_WEIGHT_VALUE = 0.01;

export const MAXIMUM_WEIGHT_VALUE = 9_999.99;

export const WEIGHT_VALUE_STEP = 0.01;
