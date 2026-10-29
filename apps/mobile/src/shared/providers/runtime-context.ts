import { createContext } from "react";

import type { ApplicationRuntime } from "#/layer.ts";

export const RuntimeContext = createContext<ApplicationRuntime | undefined>(
  undefined,
);
