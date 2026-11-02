import type { SkipReason } from "@ankaa/core/shared/constants/skip-reasons";

import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useMutation } from "@tanstack/react-query";
import * as DateTime from "effect/DateTime";
import { useState } from "react";

import { createAbsenceFormSchema } from "#/features/absence/core/create-absence-form-schema.ts";
import { formatCalendarDate } from "#/features/absence/core/format-calendar-date.ts";
import { getAbsenceRecordErrorMessage } from "#/features/absence/core/get-absence-record-error-message.ts";
import { ABSENCE_MESSAGES } from "#/features/absence/messages/absence-messages.ts";
import { absenceRecordMutationOptions } from "#/features/absence/mutations/absence-record-mutation-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { SkipReasonPicker } from "#/shared/components/skip-reason-picker.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

/**
 * Lets the User record an Absence from a Routine, on today's date by default
 * and never on a later one, where today is the date of `openedAt` in the
 * device's time zone, which the record sends along.
 */
export function AbsenceRecordForm({
  onCancel,
  onRecord,
  openedAt,
  routineId,
}: {
  onCancel: () => void;
  onRecord: () => void;
  openedAt: DateTime.Zoned;
  routineId: string;
}) {
  const runtime = useRuntime();

  const [selectedDate, setSelectedDate] = useState(getOpenedAtDate);

  const [reason, setReason] = useState<null | SkipReason>(null);

  const [note, setNote] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const recordAbsence = useMutation({
    ...absenceRecordMutationOptions(runtime),
    onSuccess: onRecord,
  });

  const absenceFormDecoding = decodeForm({
    hasSubmitted,
    schema: createAbsenceFormSchema({
      today: DateTime.formatIsoDate(openedAt),
    }),
    values: {
      date: formatCalendarDate({
        date: selectedDate,
        timeZone: openedAt.zone,
      }),
      note,
      reason,
    },
  });
  const statusMessage = getStatusMessage();

  function getOpenedAtDate() {
    return DateTime.toDateUtc(openedAt);
  }

  function getStatusMessage() {
    if (recordAbsence.error !== null) {
      return getAbsenceRecordErrorMessage(recordAbsence.error);
    }

    return (
      absenceFormDecoding.errorMessages.date ??
      absenceFormDecoding.errorMessages.reason
    );
  }

  function handleRecordAbsence() {
    if (recordAbsence.isPending) {
      return;
    }

    setHasSubmitted(true);
    recordAbsence.reset();

    if (absenceFormDecoding.value !== null) {
      recordAbsence.mutate({
        ...absenceFormDecoding.value,
        routineId,
        timeZone: DateTime.zoneToString(openedAt.zone),
      });
    }
  }

  return (
    <>
      <Text>{ABSENCE_MESSAGES.dateLabel}</Text>
      <DateTimePicker
        maximumDate={getOpenedAtDate()}
        mode="date"
        onValueChange={(event, date) => {
          setSelectedDate(date);
        }}
        presentation="inline"
        testID={ABSENCE_MESSAGES.dateLabel}
        value={selectedDate}
      />
      <SkipReasonPicker
        label={ABSENCE_MESSAGES.reasonLabel}
        noReasonLabel={ABSENCE_MESSAGES.noReasonLabel}
        onChangeReason={setReason}
        reason={reason}
      />
      <TextField
        errorMessage={null}
        label={ABSENCE_MESSAGES.noteLabel}
        onChangeText={setNote}
        value={note}
      />
      <Button
        isBusy={recordAbsence.isPending}
        onPress={handleRecordAbsence}
        title={ABSENCE_MESSAGES.recordAbsenceButton}
      />
      <Button onPress={onCancel} title={ABSENCE_MESSAGES.cancelAbsenceButton} />
      <StatusMessage message={statusMessage} />
    </>
  );
}
