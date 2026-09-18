import { z } from "zod";

let loaded = false;

export function createEnv<T extends z.ZodRawShape>(shape: T) {
  loadEnvFile();
  const result = z.object(shape).safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Missing or invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

function loadEnvFile() {
  if (loaded) {
    return;
  }
  try {
    process.loadEnvFile();
  } catch (error) {
    if (!(
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    )) {
      throw error;
    }
  }
  loaded = true;
}
