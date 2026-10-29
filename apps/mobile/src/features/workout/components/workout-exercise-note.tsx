import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NoteDraft } from "#/features/workout/core/note-form-schema.ts";

import { getWorkoutSaveNoteErrorMessage } from "#/features/workout/core/get-workout-save-note-error-message.ts";
import { noteFormSchema } from "#/features/workout/core/note-form-schema.ts";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutSaveNoteMutationOptions } from "#/features/workout/mutations/workout-save-note-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

/**
 * Lets the User write the note of a Workout exercise and Save it through its
 * own button.
 */
export function WorkoutExerciseNote({
  draft,
  exerciseId,
  note,
  workoutExerciseId,
}: {
  draft: NoteDraft | null;
  exerciseId: string;
  note: null | string;
  workoutExerciseId: string;
}) {
  const queryClient = useQueryClient();

  const workoutContext = useWorkoutContext();

  const runtime = useRuntime();

  const saveNote = useMutation({
    ...workoutSaveNoteMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      workoutContext.dispatch({ type: "clearedNoteDraft", workoutExerciseId });
    },
  });

  const savedNoteDraft = { note: note ?? "" };
  const noteDraft = draft ?? savedNoteDraft;
  const statusMessage =
    saveNote.error === null
      ? null
      : getWorkoutSaveNoteErrorMessage(saveNote.error);

  function handleChangeNote(changedNote: string) {
    workoutContext.dispatch(
      changedNote === savedNoteDraft.note
        ? { type: "clearedNoteDraft", workoutExerciseId }
        : {
            entry: {
              draft: { note: changedNote },
              exerciseId,
              workoutExerciseId,
            },
            type: "changedNoteDraft",
          },
    );
  }

  function handleSaveNote() {
    if (saveNote.isPending) {
      return;
    }

    saveNote.reset();

    const noteFormDecoding = decodeForm({
      hasSubmitted: true,
      schema: noteFormSchema,
      values: noteDraft,
    });

    if (noteFormDecoding.value !== null) {
      saveNote.mutate({ ...noteFormDecoding.value, workoutExerciseId });
    }
  }

  return (
    <>
      <TextField
        errorMessage={null}
        label={WORKOUT_MESSAGES.noteLabel}
        onChangeText={handleChangeNote}
        value={noteDraft.note}
      />
      <Button
        isBusy={saveNote.isPending}
        onPress={handleSaveNote}
        title={WORKOUT_MESSAGES.saveNoteButton}
      />
      <StatusMessage message={statusMessage} />
    </>
  );
}
