export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type MuscleGroupRole = (typeof MUSCLE_GROUP_ROLES)[number];

export const MUSCLE_GROUPS = ["chest", "triceps", "front_deltoid"] as const;

export const MUSCLE_GROUP_ROLES = ["primary", "secondary"] as const;
