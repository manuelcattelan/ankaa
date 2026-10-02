import { z } from "zod";

type CreateEnvironmentOptions<TShape extends z.ZodRawShape> = {
  runtimeEnvironment: Record<string, string | undefined>;
  shape: TShape;
};

export const nodeEnvironmentSchema = z.enum(["development", "production"]);

export function createEnvironment<TShape extends z.ZodRawShape>({
  runtimeEnvironment,
  shape,
}: CreateEnvironmentOptions<TShape>) {
  const parsedEnvironment = z.object(shape).safeParse(runtimeEnvironment);

  if (!parsedEnvironment.success) {
    throw new Error(
      `Environment variables must be valid:\n${z.prettifyError(parsedEnvironment.error)}`,
    );
  }

  return parsedEnvironment.data;
}
