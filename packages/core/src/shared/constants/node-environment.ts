export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export const NODE_ENVIRONMENTS = ["development", "production"] as const;
