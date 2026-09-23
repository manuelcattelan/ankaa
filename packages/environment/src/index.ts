import { z } from "zod";

type CreateEnvironmentOptions<TShape extends z.ZodRawShape> = {
  runtimeEnvironment: Record<string, string | undefined>;
  shape: TShape;
};

export function createEnvironment<TShape extends z.ZodRawShape>({
  runtimeEnvironment,
  shape,
}: CreateEnvironmentOptions<TShape>) {
  const result = z.object(shape).safeParse(runtimeEnvironment);

  if (!result.success) {
    throw new Error(
      `Environment variables must be valid:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
