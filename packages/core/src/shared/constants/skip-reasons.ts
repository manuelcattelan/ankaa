export type SkipReason = (typeof SKIP_REASONS)[number];

export const SKIP_REASONS = [
  "low_on_time",
  "low_energy",
  "pain",
  "other",
] as const;
