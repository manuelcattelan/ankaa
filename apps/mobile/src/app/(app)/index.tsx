import type { Href } from "expo-router";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { Fragment, useEffect } from "react";
import { ActivityIndicator } from "react-native";

import type { Exercise } from "@/components/exercise-picker";
import type { Routine } from "@/components/routine-editor";
import type { WorkoutDocument } from "@/utilities/workout-documents";

import { authenticationClient } from "@/clients/authentication";
import { useTrpc } from "@/clients/trpc";
import { useWorkoutDocuments } from "@/clients/workout-documents";
import { Button } from "@/components/button";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { announceMessage } from "@/utilities/accessibility";
import { getTrpcErrorMessage } from "@/utilities/errors";
import { createIdentifier } from "@/utilities/identifiers";
import { messages } from "@/utilities/messages";

type BuildWorkoutDocumentOptions = {
  exercises: Exercise[];
  routine: Routine;
  userId: string;
};

type CanStartWorkoutOptions = {
  exerciseIds: Set<string>;
  routine: Routine;
};

type LinkButtonProperties = {
  href: Href;
  title: string;
};

const WORKOUT_DOCUMENT_INITIAL_VERSION = 1;
const WORKOUT_DOCUMENT_INITIAL_SYNCED_VERSION = 0;

export default function AppScreen() {
  const router = useRouter();

  const trpc = useTrpc();

  const session = authenticationClient.useSession();

  const workoutDocuments = useWorkoutDocuments();

  const routines = useQuery(trpc.routine.list.queryOptions());
  const exerciseLibrary = useQuery(trpc.exercise.list.queryOptions());

  const signOut = useMutation({
    mutationFn: () => authenticationClient.signOut(),
  });

  const exerciseIds = new Set(
    exerciseLibrary.data?.map((exercise) => exercise.id),
  );
  const routinesErrorMessage = routines.error
    ? getTrpcErrorMessage(routines.error)
    : undefined;
  const routinesStatusMessage =
    routines.data?.length === 0
      ? messages.app.routineListEmptyStatus
      : routinesErrorMessage;

  useEffect(() => {
    if (routinesErrorMessage) {
      announceMessage(routinesErrorMessage);
    }
  }, [routinesErrorMessage]);

  function handleSignOut() {
    if (signOut.isPending) {
      return;
    }

    signOut.mutate();
  }

  function handleStartWorkout(routine: Routine) {
    if (
      !exerciseLibrary.data ||
      !session.data ||
      workoutDocuments.runningWorkoutDocument
    ) {
      return;
    }

    workoutDocuments.dispatchWorkoutDocumentsAction({
      type: "startedWorkout",
      workoutDocument: buildWorkoutDocument({
        exercises: exerciseLibrary.data,
        routine,
        userId: session.data.user.id,
      }),
    });

    router.push("/workout");
  }

  return (
    <ScrollView>
      {workoutDocuments.runningWorkoutDocument ? (
        <LinkButton href="/workout" title={messages.app.resumeWorkoutButton} />
      ) : null}
      {routines.isPending ? <ActivityIndicator /> : null}
      <StatusMessage
        message={
          workoutDocuments.hasWorkoutSaveFailed
            ? messages.app.workoutSaveFailedStatus
            : undefined
        }
      />
      <StatusMessage message={routinesStatusMessage} />
      {routines.data?.map((routine) => (
        <Fragment key={routine.id}>
          <LinkButton
            href={{
              params: { routineId: routine.id },
              pathname: "/routines/[routineId]",
            }}
            title={routine.name}
          />
          {workoutDocuments.runningWorkoutDocument === undefined ? (
            <Button
              disabled={!canStartWorkout({ exerciseIds, routine })}
              onPress={() => {
                handleStartWorkout(routine);
              }}
              title={messages.app.startWorkoutButton(routine.name)}
            />
          ) : null}
        </Fragment>
      ))}
      <LinkButton href="/routines/new" title={messages.app.newRoutineButton} />
      <Button
        isBusy={signOut.isPending}
        onPress={handleSignOut}
        title={messages.app.signOutButton}
      />
    </ScrollView>
  );
}

function buildWorkoutDocument({
  exercises,
  routine,
  userId,
}: BuildWorkoutDocumentOptions) {
  const identifiedRoutineExercises = routine.exercises.map(
    (routineExercise) => ({
      routineExercise,
      workoutExerciseId: createIdentifier(),
    }),
  );

  const workoutDocument: WorkoutDocument = {
    exercises: identifiedRoutineExercises.flatMap(
      ({ routineExercise, workoutExerciseId }) => {
        const libraryExercise = exercises.find(
          (exercise) => exercise.id === routineExercise.exerciseId,
        );

        if (!libraryExercise) {
          return [];
        }

        return [
          {
            amountUnit: libraryExercise.amountUnit,
            exerciseId: routineExercise.exerciseId,
            id: workoutExerciseId,
            note: "",
            routineExerciseNote: routineExercise.note ?? undefined,
            routineExerciseSets: routineExercise.sets.map(
              (routineExerciseSet) => ({
                amount: routineExerciseSet.amount ?? undefined,
                dropSetSegmentCount:
                  routineExerciseSet.dropSetSegmentCount ?? undefined,
                dropSetWeightPercentage:
                  routineExerciseSet.dropSetWeightPercentage ?? undefined,
                isToFailure: routineExerciseSet.isToFailure,
                restPauseRestSeconds:
                  routineExerciseSet.restPauseRestSeconds ?? undefined,
                restPauseSegmentCount:
                  routineExerciseSet.restPauseSegmentCount ?? undefined,
                restSeconds: routineExerciseSet.restSeconds ?? undefined,
                setType: routineExerciseSet.setType,
                tempo: routineExerciseSet.tempo ?? undefined,
                variation: routineExerciseSet.variation ?? undefined,
              }),
            ),
            section: routineExercise.section,
            sets: [],
            skipReasonNote: "",
            superset: routineExercise.superset ?? undefined,
            warmUpForWorkoutExerciseId: identifiedRoutineExercises.find(
              (identifiedRoutineExercise) =>
                identifiedRoutineExercise.routineExercise.id ===
                routineExercise.warmUpForRoutineExerciseId,
            )?.workoutExerciseId,
            weightType: libraryExercise.weightType,
          },
        ];
      },
    ),
    id: createIdentifier(),
    routineId: routine.id,
    startedAt: new Date().toISOString(),
    syncedVersion: WORKOUT_DOCUMENT_INITIAL_SYNCED_VERSION,
    userId,
    version: WORKOUT_DOCUMENT_INITIAL_VERSION,
  };

  return workoutDocument;
}

function canStartWorkout({ exerciseIds, routine }: CanStartWorkoutOptions) {
  return (
    exerciseIds.size > 0 &&
    routine.exercises.every((routineExercise) =>
      exerciseIds.has(routineExercise.exerciseId),
    )
  );
}

function LinkButton({ href, title }: LinkButtonProperties) {
  return (
    <Link asChild href={href}>
      <Button title={title} />
    </Link>
  );
}
