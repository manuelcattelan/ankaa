import { formatCount } from "@/utilities/format";

type SetCounterStatusOptions = {
  workingSetDoneCount: number;
  workingSetLeftCount: number;
};

type TextFieldErrorLabelOptions = {
  errorMessage: string;
  label: string;
};

type WeightValueRangeErrorOptions = {
  maximum: number;
  minimum: number;
};

type WholeNumberOutOfRangeOptions = {
  maximum: number;
  minimum: number;
};

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const messages = {
  app: {
    newRoutineButton: "New routine",
    resumeWorkoutButton: "Resume workout",
    routineListEmptyStatus: "You have no routines yet.",
    signOutButton: "Sign out",
    startWorkoutButton: (routineName: string) => `Start ${routineName}`,
    title: "Ankaa",
    workoutSaveFailedStatus:
      "A workout couldn't be saved: it stays on this device, and the app sends it again the next time you open it.",
  },
  error: {
    accountNotConnected:
      "This account can't be linked with the selected provider: try another sign-in method.",
    emailInvalid:
      "This email address isn't valid: enter an address like name@example.com.",
    emailNotShared:
      "The selected provider didn't share your email address: try another sign-in method.",
    otpCodeAttemptsExceeded:
      "Too many incorrect attempts: resend the verification code and try again.",
    otpCodeExpired:
      "This verification code has expired: resend the verification code and try again.",
    otpCodeInvalid:
      "This verification code is incorrect: check the verification code in your email and try again.",
    playServicesMissing:
      "Google Play services aren't installed on this device: try another sign-in method.",
    requestsRateLimited: (seconds: number) =>
      `Too many requests: try again in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    requestsRateLimitedWithoutDelay:
      "Too many requests: try again in a moment.",
    serverUnreachable:
      "The server can't be reached: check your connection and try again.",
    unknown: "Something went wrong: try again.",
    wholeNumberBelowMinimum: (minimum: number) =>
      `This number isn't valid: enter a whole number of at least ${minimum}.`,
    wholeNumberOutOfRange: ({
      maximum,
      minimum,
    }: WholeNumberOutOfRangeOptions) =>
      `This number isn't valid: enter a whole number from ${minimum} to ${maximum}.`,
  },
  exercisePicker: {
    barbellEquipmentLabel: "Barbell",
    benchEquipmentLabel: "Bench",
    chestMuscleGroupLabel: "Chest",
    equipmentFilterLabel: "Equipment you have",
    exerciseListEmptyStatus: "No exercises match your filters.",
    exerciseNameFilterLabel: "Exercise name",
    frontDeltoidMuscleGroupLabel: "Front deltoid",
    muscleGroupFilterLabel: "Muscle groups",
    rackEquipmentLabel: "Rack",
    tricepsMuscleGroupLabel: "Triceps",
  },
  new: {
    title: "New routine",
  },
  notFound: {
    body: "This screen doesn't exist.",
    goHomeButton: "Go to home screen",
    title: "Screen not found",
  },
  restNotification: {
    body: "Start your next set.",
    title: "Your rest is over",
  },
  routineEditor: {
    addExerciseButton: "Add exercise",
    addSetButton: "Add set",
    addWarmUpExerciseButton: "Add warm-up exercise",
    amountLabel: "Repetitions or seconds",
    coolDownSectionLabel: "Cool-down",
    daysLabel: "Days",
    deleteRoutineButton: "Delete routine",
    dropSetSegmentCountLabel: "Number of drops, the first set included",
    dropSetVariationLabel: "Drop set",
    dropSetWeightPercentageLabel: "Weight to drop each time, in percent",
    exerciseNoteLabel: "Note",
    fridayDayLabel: "Friday",
    joinSupersetButton: "Superset with next exercise",
    leaveSupersetButton: "Leave superset",
    mainSectionLabel: "Main",
    mondayDayLabel: "Monday",
    moveDownButton: "Move down",
    moveUpButton: "Move up",
    noVariationLabel: "None",
    removeExerciseButton: "Remove exercise",
    removeSetButton: "Remove set",
    restPauseRestSecondsLabel: "Rest between rest-pause segments, in seconds",
    restPauseSegmentCountLabel:
      "Number of rest-pause segments, the first included",
    restPauseVariationLabel: "Rest-pause",
    restSecondsLabel: "Rest after the set, in seconds",
    routineDraftInvalidError:
      "Some fields aren't valid: correct the fields marked with an error.",
    routineNameEmptyError: "This routine has no name: enter a name.",
    routineNameLabel: "Name",
    routineNameTakenError:
      "You already have a routine with this name: enter another name.",
    saturdayDayLabel: "Saturday",
    saveRoutineButton: "Save routine",
    setLabel: (setNumber: number) => `Set ${setNumber}`,
    setTypeLabel: "Set type",
    sundayDayLabel: "Sunday",
    supersetLabel: "Superset",
    tempoFormatError:
      "This tempo isn't valid: enter four numbers separated by hyphens, like 3-0-1-2, with X allowed only as the third.",
    tempoLabel: "Tempo",
    thursdayDayLabel: "Thursday",
    toFailureLabel: "To failure",
    tuesdayDayLabel: "Tuesday",
    variationLabel: "Variation",
    warmUpForExerciseLabel: (exerciseName: string) =>
      `Warm-up for ${exerciseName}`,
    warmUpSectionLabel: "Warm-up",
    warmUpSetTypeLabel: "Warm-up",
    wednesdayDayLabel: "Wednesday",
    workingSetTypeLabel: "Working",
  },
  routineId: {
    title: "Edit routine",
  },
  signIn: {
    continueWithEmailButton: "Continue with email address",
    title: "Sign in",
  },
  textField: {
    errorLabel: ({ errorMessage, label }: TextFieldErrorLabelOptions) =>
      `${label}, error: ${errorMessage}`,
  },
  validateOtpCode: {
    otpCodeLabel: "Verification code",
    otpCodeLengthError: (otpCodeLength: number) =>
      `This verification code is incomplete: enter all ${formatCount({ count: otpCodeLength, plural: "digits", singular: "digit" })}.`,
    resendOtpCodeButton: "Resend verification code",
    resendOtpCodeCooldownStatus: (seconds: number) =>
      `You can resend the verification code in ${formatCount({ count: seconds, ...SECONDS_UNIT })}.`,
    resendOtpCodeHint: "Sends a new verification code to your email address.",
    resendOtpCodeReadyAnnouncement: "You can resend the verification code.",
    title: "Enter verification code",
    validateOtpCodeButton: "Sign in",
    validateOtpCodeReadyAnnouncement: "You can try to sign in again.",
  },
  withEmail: {
    emailLabel: "Email address",
    sendOtpCodeButton: "Continue with email address",
    title: "Continue with email address",
  },
  workout: {
    addDropSetSegmentButton: "Add drop",
    addRestPauseSegmentButton: "Add rest-pause segment",
    addSetButton: "Add set",
    assistedWeightTypeDescription:
      "Enter the weight taken off your body weight.",
    bodyweightWeightTypeDescription:
      "Enter the weight added to your body weight, or leave it empty for your body weight only.",
    coolDownSectionLabel: "Cool-down",
    dropSetVariationLabel: "Drop set",
    elapsedTimeStatus: (elapsedTime: string) => `Elapsed time: ${elapsedTime}`,
    exerciseNoteLabel: "Note for this workout",
    kilogramWeightUnitLabel: "Kilograms",
    lowEnergySkipReasonLabel: "Low energy",
    lowOnTimeSkipReasonLabel: "Low on time",
    mainSectionLabel: "Main",
    noSkipReasonLabel: "Not skipped",
    otherSkipReasonLabel: "Other",
    painSkipReasonLabel: "Pain",
    poundWeightUnitLabel: "Pounds",
    removeSetButton: "Remove set",
    repetitionAmountLabel: "Repetitions",
    restPauseVariationLabel: "Rest-pause",
    restTimerStatus: (restRemainingSeconds: number) =>
      `Rest: ${formatCount({ count: restRemainingSeconds, ...SECONDS_UNIT })} left.`,
    routineExerciseNoteLabel: (routineExerciseNote: string) =>
      `Routine note: ${routineExerciseNote}`,
    secondAmountLabel: "Seconds",
    segmentLabel: (segmentNumber: number) => `Segment ${segmentNumber}`,
    setCounterStatus: ({
      workingSetDoneCount,
      workingSetLeftCount,
    }: SetCounterStatusOptions) =>
      `${formatCount({ count: workingSetDoneCount, plural: "working sets", singular: "working set" })} done, ${workingSetLeftCount} left.`,
    setLabel: (setNumber: number) => `Set ${setNumber}`,
    singleWeightTypeDescription:
      "Enter the weight of one dumbbell or one side.",
    skipReasonLabel: "Skipped",
    skipReasonNoteLabel: "Why you skipped it",
    skipRestButton: "Skip rest",
    startRestButton: "Start rest",
    stopWorkoutButton: "Stop workout",
    supersetLabel: "Superset",
    tempoDescription:
      "The seconds for lowering, pausing at the bottom, lifting and pausing at the top. X means lifting as fast as you can.",
    tempoLabel: (tempo: string) => `Tempo ${tempo}`,
    title: "Workout",
    toFailureLabel: "To failure",
    totalWeightTypeDescription: "Enter everything you lift.",
    warmUpForExerciseLabel: (exerciseName: string) =>
      `Warm-up for ${exerciseName}`,
    warmUpSectionLabel: "Warm-up",
    warmUpSetLabel: (setNumber: number) => `Set ${setNumber}, warm-up`,
    weightUnitLabel: "Weight unit",
    weightValueLabel: "Weight",
    weightValueRangeError: ({
      maximum,
      minimum,
    }: WeightValueRangeErrorOptions) =>
      `This weight isn't valid: enter a number from ${minimum} to ${maximum}, with at most two decimal places.`,
    workoutInvalidError:
      "Some fields aren't valid: correct the fields marked with an error.",
  },
};
