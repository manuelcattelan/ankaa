export const AMOUNT_UNITS = ["repetition", "second"] as const;

export const WEIGHT_TYPES = [
  "total",
  "single",
  "bodyweight",
  "assisted",
  "none",
] as const;

export const MUSCLE_GROUPS = ["chest", "triceps", "front_deltoid"] as const;

export const MUSCLE_GROUP_ROLES = ["primary", "secondary"] as const;

export const EQUIPMENT = ["barbell", "bench", "rack"] as const;

const WARM_UP_VALUE = "warm_up";

export const SECTIONS = [WARM_UP_VALUE, "main", "cool_down"] as const;

export const SET_TYPES = [WARM_UP_VALUE, "working"] as const;

export const VARIATIONS = ["rest_pause", "drop_set"] as const;

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const TEMPO_PATTERN =
  /^[0-9]{1,2}-[0-9]{1,2}-([0-9]{1,2}|X)-[0-9]{1,2}$/;

export const POSITION_MINIMUM = 0;

export const AMOUNT_MINIMUM = 1;

export const REST_SECONDS_MINIMUM = 1;

export const SEGMENT_COUNT_MINIMUM = 2;

export const DROP_SET_WEIGHT_PERCENTAGE_MINIMUM = 1;

export const DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM = 99;
