import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoSqliteKeyValueStore from "expo-sqlite/kv-store";

type WrittenWorkoutDocumentJson = {
  workoutDocumentJson: string;
  workoutId: string;
};

const WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX = "workout-document:";

export class WorkoutDocumentStorage extends Context.Service<WorkoutDocumentStorage>()(
  "@ankaa/mobile/features/workout/services/WorkoutDocumentStorage",
  {
    make: Effect.sync(() => {
      function readStoredWorkoutDocumentJsons() {
        return Effect.sync(() =>
          ExpoSqliteKeyValueStore.Storage.getAllKeysSync()
            .filter((storageKey) =>
              storageKey.startsWith(WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX),
            )
            .map((storageKey) => ({
              workoutDocumentJson:
                ExpoSqliteKeyValueStore.Storage.getItemSync(storageKey),
              workoutId: storageKey.slice(
                WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX.length,
              ),
            })),
        );
      }

      function removeWorkoutDocumentJson(workoutId: string) {
        return Effect.sync(() => {
          ExpoSqliteKeyValueStore.Storage.removeItemSync(
            getWorkoutDocumentStorageKey(workoutId),
          );
        });
      }

      function writeWorkoutDocumentJson({
        workoutDocumentJson,
        workoutId,
      }: WrittenWorkoutDocumentJson) {
        return Effect.sync(() => {
          ExpoSqliteKeyValueStore.Storage.setItemSync(
            getWorkoutDocumentStorageKey(workoutId),
            workoutDocumentJson,
          );
        });
      }

      return {
        readStoredWorkoutDocumentJsons,
        removeWorkoutDocumentJson,
        writeWorkoutDocumentJson,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerTest = (
    storedWorkoutDocumentJsons: Map<string, string>,
  ) =>
    Layer.succeed(
      this,
      this.of({
        readStoredWorkoutDocumentJsons: () =>
          Effect.sync(() =>
            [...storedWorkoutDocumentJsons].map(
              ([workoutId, workoutDocumentJson]) => ({
                workoutDocumentJson,
                workoutId,
              }),
            ),
          ),
        removeWorkoutDocumentJson: (workoutId: string) =>
          Effect.sync(() => {
            storedWorkoutDocumentJsons.delete(workoutId);
          }),
        writeWorkoutDocumentJson: ({
          workoutDocumentJson,
          workoutId,
        }: WrittenWorkoutDocumentJson) =>
          Effect.sync(() => {
            storedWorkoutDocumentJsons.set(workoutId, workoutDocumentJson);
          }),
      }),
    );
}

function getWorkoutDocumentStorageKey(workoutId: string) {
  return `${WORKOUT_DOCUMENT_STORAGE_KEY_PREFIX}${workoutId}`;
}
