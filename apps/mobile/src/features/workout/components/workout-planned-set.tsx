import type { AmountUnit } from "@ankaa/core/shared/constants/amount";

import type { Workout } from "#/shared/workout.ts";

import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Shows the matching planned Set of one Set of a Workout exercise, with the
 * Amount and Rest that only a Set within its planned Sets has.
 */
export function WorkoutPlannedSet({
  amountUnit,
  plannedSet,
  setNumber,
}: {
  amountUnit: AmountUnit;
  plannedSet: Omit<
    Workout["sections"]["coolDown"][number]["exercises"][number]["plannedSets"][number],
    "id"
  >;
  setNumber: number;
}) {
  return (
    <>
      <Text>
        {plannedSet.type === "warm_up"
          ? WORKOUT_MESSAGES.warmUpSetLabel(setNumber)
          : SHARED_MESSAGES.setLabel(setNumber)}
      </Text>
      {plannedSet.amount === null ? null : (
        <Text>
          {WORKOUT_MESSAGES.plannedAmountLabels[amountUnit](plannedSet.amount)}
        </Text>
      )}
      {plannedSet.isToFailure ? (
        <Text>{WORKOUT_MESSAGES.toFailureLabel}</Text>
      ) : null}
      {plannedSet.tempo === null ? null : (
        <>
          <Text>{WORKOUT_MESSAGES.tempoLabel(plannedSet.tempo)}</Text>
          <Text>{WORKOUT_MESSAGES.tempoDescription}</Text>
        </>
      )}
      {plannedSet.intensityTechnique?._tag === "DropSet" ? (
        <Text>
          {WORKOUT_MESSAGES.dropSetLabel(
            plannedSet.intensityTechnique.weightPercentage,
          )}
        </Text>
      ) : null}
      {plannedSet.intensityTechnique?._tag === "RestPauseSet" ? (
        <Text>
          {WORKOUT_MESSAGES.restPauseSetLabel(plannedSet.intensityTechnique)}
        </Text>
      ) : null}
      {plannedSet.restSeconds === null ? null : (
        <Text>{WORKOUT_MESSAGES.restLabel(plannedSet.restSeconds)}</Text>
      )}
    </>
  );
}
