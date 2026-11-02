import type { Section } from "@ankaa/core/shared/constants/sections";

export const SHARED_MESSAGES = {
  goHomeButton: "Go to home screen",
  homeScreenTitle: "Ankaa",
  notFoundScreenBody: "This screen doesn't exist.",
  notFoundScreenTitle: "Screen not found",
  sectionLabels: {
    cool_down: "Cool-down",
    main: "Main",
    warm_up: "Warm-up",
  } satisfies Record<Section, string>,
  serverUnreachableError:
    "Ankaa can't connect: check your internet connection and try again.",
  setLabel: (setNumber: number) => `Set ${String(setNumber)}`,
  supersetLabel: "Superset",
  textFieldErrorLabel: ({
    errorMessage,
    label,
  }: {
    errorMessage: string;
    label: string;
  }) => `${label}, error: ${errorMessage}`,
  unknownError: "Something went wrong: try again.",
  warmUpForExerciseLabel: (exerciseName: string) =>
    `Warm-up for ${exerciseName}`,
};
