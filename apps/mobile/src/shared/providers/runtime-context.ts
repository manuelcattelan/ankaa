import { createContext } from "react";

import type { ApplicationRuntime } from "@/layer";

export const RuntimeContext = createContext<ApplicationRuntime | undefined>(
  undefined,
);
