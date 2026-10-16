import type { AppRouter } from "@ankaa/api/trpc/router";
import type { inferRouterOutputs } from "@trpc/server";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import type { WorkoutDocument } from "@/utilities/workout-documents";

import { useTrpc } from "@/clients/trpc";
import { useWorkoutDocuments } from "@/clients/workout-documents";
import { RoutineList } from "@/features/routine/components/routine-list";
import { Button } from "@/shared/components/button";
import { LinkButton } from "@/shared/components/link-button";
import { ScrollView } from "@/shared/components/scroll-view";
import { StatusMessage } from "@/shared/components/status-message";
import { useAuthenticationClient } from "@/shared/hooks/use-authentication-client";
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

type Exercise = inferRouterOutputs<AppRouter>["exercise"]["list"][number];

type Routine = inferRouterOutputs<AppRouter>["routine"]["list"][number];

const WORKOUT_DOCUMENT_INITIAL_VERSION = 1;
const WORKOUT_DOCUMENT_INITIAL_SYNCED_VERSION = 0;

export default function AppRoute() {
  const router = useRouter();

  const trpc = useTrpc();

  const authenticationClient = useAuthenticationClient();

  const session = authenticationClient.betterAuthenticationClient.useSession();

  const workoutDocuments = useWorkoutDocuments();

  const exerciseLibrary = useQuery(trpc.exercise.list.queryOptions());

  const signOut = useMutation({
    mutationFn: () => authenticationClient.betterAuthenticationClient.signOut(),
  });

  const exerciseIds = new Set(
    exerciseLibrary.data?.map((exercise) => exercise.id),
  );

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
      <RoutineList
        renderRoutineActions={(routine) =>
          workoutDocuments.runningWorkoutDocument === undefined ? (
            <Button
              disabled={!canStartWorkout({ exerciseIds, routine })}
              onPress={() => {
                handleStartWorkout(routine);
              }}
              title={messages.app.startWorkoutButton(routine.name)}
            />
          ) : undefined
        }
      >
        <StatusMessage
          message={
            workoutDocuments.hasWorkoutSaveFailed
              ? messages.app.workoutSaveFailedStatus
              : undefined
          }
        />
      </RoutineList>
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
