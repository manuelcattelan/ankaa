export type WeightType = (typeof WEIGHT_TYPES)[number];

export const WEIGHT_TYPES = [
  "total",
  "single",
  "bodyweight",
  "assisted",
  "none",
] as const;
