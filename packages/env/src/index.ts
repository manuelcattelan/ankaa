import { z } from "zod";

export function createEnv<T extends z.ZodRawShape>(
  shape: T,
  runtimeEnv: Record<string, string | undefined>,
) {
  const result = z.object(shape).safeParse(runtimeEnv);
  if (!result.success) {
    throw new Error(
      `Missing or invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
