export const ABSENCE_MESSAGES = {
  absenceDateConflictError:
    "You already recorded that you couldn't do this routine on this day.",
  absenceDateInFutureError:
    "This day hasn't come yet where you are: pick today or a day before it.",
  absenceRecordedStatus: (routineName: string) =>
    `You recorded that you couldn't do ${routineName}.`,
  cancelAbsenceButton: "Cancel",
  dateInFutureError: "This day hasn't come yet: pick today or a day before it.",
  dateLabel: "Day you couldn't train",
  noReasonLabel: "Pick a reason",
  noteLabel: "Note",
  openAbsenceFormButton: (routineName: string) =>
    `Record absence from ${routineName}`,
  reasonLabel: "Why you couldn't train",
  reasonMissingError: "Pick why you couldn't train.",
  recordAbsenceButton: "Record absence",
  routineNotFoundError:
    "This routine doesn't exist anymore: pick another routine.",
};
