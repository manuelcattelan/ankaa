export type AmountUnit = (typeof AMOUNT_UNITS)[number];

export const AMOUNT_UNITS = ["repetition", "second"] as const;

export const AMOUNT_MINIMUM = 1;
