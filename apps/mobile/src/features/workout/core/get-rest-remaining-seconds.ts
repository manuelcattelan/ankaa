import type { WorkoutDocumentRestTimer } from "@/features/workout/core/workout-document-schema";

import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time";
import { getRemainingSeconds } from "@/shared/core/get-remaining-seconds";

type GetRestRemainingSecondsOptions = {
  currentTime: number;
  restTimer: undefined | WorkoutDocumentRestTimer;
};

export function getRestRemainingSeconds({
  currentTime,
  restTimer,
}: GetRestRemainingSecondsOptions) {
  return restTimer
    ? getRemainingSeconds({
        currentTime,
        deadline:
          Date.parse(restTimer.startedAt) +
          restTimer.restSeconds * MILLISECONDS_PER_SECOND,
      })
    : 0;
}
