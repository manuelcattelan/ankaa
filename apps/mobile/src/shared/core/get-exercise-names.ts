/**
 * Gives the name of each Exercise by its id, for the `select` of the
 * Exercise list's Query options.
 */
export function getExerciseNames(
  exercises: readonly { id: string; name: string }[],
) {
  return new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
}
