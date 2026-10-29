import type { Section } from "@ankaa/core/shared/constants/sections";

import { Fragment } from "react";

import type { ExercisePickerTarget } from "#/features/routine/components/routine-editor-section.tsx";
import type {
  ExerciseGroupDraft,
  ExerciseGroupMoveDirection,
  MainExerciseGroupDraft,
  RoutineDraftAction,
} from "#/features/routine/core/routine-draft-reducer.ts";

import { RoutineEditorExercise } from "#/features/routine/components/routine-editor-exercise.tsx";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { Text } from "#/shared/components/text.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { createId } from "#/shared/interactors/create-id.ts";

const MINIMUM_SUPERSET_EXERCISE_COUNT = 2;

export function RoutineEditorExerciseGroup({
  dispatch,
  exerciseGroup,
  exerciseNames,
  hasSubmitted,
  isFirst,
  isLast,
  onOpenExercisePicker,
  section,
}: {
  dispatch: (action: RoutineDraftAction) => void;
  exerciseGroup: ExerciseGroupDraft | MainExerciseGroupDraft;
  exerciseNames: Map<string, string>;
  hasSubmitted: boolean;
  isFirst: boolean;
  isLast: boolean;
  onOpenExercisePicker: (exercisePickerTarget: ExercisePickerTarget) => void;
  section: Section;
}) {
  const runtime = useRuntime();

  const isSuperset =
    exerciseGroup.exercises.length >= MINIMUM_SUPERSET_EXERCISE_COUNT;

  function handleMoveExerciseGroup(
    exerciseGroupMoveDirection: ExerciseGroupMoveDirection,
  ) {
    dispatch({
      exerciseGroupId: exerciseGroup.id,
      exerciseGroupMoveDirection,
      section,
      type: "movedExerciseGroup",
    });
  }

  function handleLeaveSuperset(routineExerciseId: string) {
    dispatch({
      exerciseGroupId: runtime.runSync(createId()),
      routineExerciseId,
      section,
      type: "leftSuperset",
    });
  }

  return (
    <>
      {isSuperset ? <Text>{ROUTINE_MESSAGES.supersetLabel}</Text> : null}
      {exerciseGroup.exercises.map((routineExercise) => (
        <Fragment key={routineExercise.id}>
          {"warmUpExercises" in routineExercise
            ? routineExercise.warmUpExercises.map((warmUpRoutineExercise) => (
                <RoutineEditorExercise
                  dispatch={dispatch}
                  exerciseNames={exerciseNames}
                  hasSubmitted={hasSubmitted}
                  key={warmUpRoutineExercise.id}
                  routineExercise={warmUpRoutineExercise}
                  warmUpForExerciseName={
                    exerciseNames.get(routineExercise.exerciseId) ?? ""
                  }
                />
              ))
            : null}
          <RoutineEditorExercise
            dispatch={dispatch}
            exerciseNames={exerciseNames}
            hasSubmitted={hasSubmitted}
            routineExercise={routineExercise}
          >
            {"warmUpExercises" in routineExercise ? (
              <Button
                onPress={() => {
                  onOpenExercisePicker({
                    warmUpForRoutineExerciseId: routineExercise.id,
                  });
                }}
                title={ROUTINE_MESSAGES.addWarmUpExerciseButton}
              />
            ) : null}
            {isSuperset ? (
              <Button
                onPress={() => {
                  handleLeaveSuperset(routineExercise.id);
                }}
                title={ROUTINE_MESSAGES.leaveSupersetButton}
              />
            ) : null}
          </RoutineEditorExercise>
        </Fragment>
      ))}
      <Button
        disabled={isFirst}
        onPress={() => {
          handleMoveExerciseGroup("up");
        }}
        title={ROUTINE_MESSAGES.moveUpButton}
      />
      <Button
        disabled={isLast}
        onPress={() => {
          handleMoveExerciseGroup("down");
        }}
        title={ROUTINE_MESSAGES.moveDownButton}
      />
      <Button
        disabled={isLast}
        onPress={() => {
          dispatch({
            exerciseGroupId: exerciseGroup.id,
            section,
            type: "joinedNextExerciseGroup",
          });
        }}
        title={ROUTINE_MESSAGES.joinSupersetButton}
      />
    </>
  );
}
