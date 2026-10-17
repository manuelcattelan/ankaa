import { use } from "react";

import { RuntimeContext } from "@/shared/providers/runtime-context";

export function useRuntime() {
  const runtime = use(RuntimeContext);

  if (!runtime) {
    throw new Error("useRuntime must be called inside RuntimeContext");
  }

  return runtime;
}
