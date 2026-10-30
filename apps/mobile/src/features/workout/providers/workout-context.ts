import { createContext } from "react";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import type {
  WorkoutDrafts,
  WorkoutDraftsAction,
} from "#/features/workout/core/workout-drafts-reducer.ts";

type WorkoutContextValue = {
  countdown: Countdown | null;
  dispatch: (action: WorkoutDraftsAction) => void;
  drafts: WorkoutDrafts;
  exerciseNames: ReadonlyMap<string, string>;
  onEndCountdown: () => void;
  onSkipCountdown: () => void;
  onStartCountdown: (countdown: Omit<Countdown, "startTime">) => void;
};

/**
 * The state that the Workout screen shares with every Workout exercise deep
 * in its tree: every Draft with something to Save, and the one countdown of
 * Rest or a Pause, which starting another replaces.
 */
export const WorkoutContext = createContext<null | WorkoutContextValue>(null);
