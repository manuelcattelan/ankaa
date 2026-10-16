import { useRuntime } from "@/shared/hooks/use-runtime";
import { Accessibility } from "@/shared/services/accessibility";

export function useAccessibility() {
  const runtime = useRuntime();

  return runtime.runSync(Accessibility);
}
