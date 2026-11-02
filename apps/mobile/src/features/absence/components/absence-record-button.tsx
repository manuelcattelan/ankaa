import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { useState } from "react";

import { AbsenceRecordForm } from "#/features/absence/components/absence-record-form.tsx";
import { ABSENCE_MESSAGES } from "#/features/absence/messages/absence-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

const program = Effect.fn("absenceFormOpen")(function* () {
  return yield* DateTime.nowInCurrentZone;
});

/**
 * Offers to record an Absence from one Routine, whether or not a Workout is
 * in progress, and opens its form at the time the User asks, in the device's
 * time zone, which gives the form its today.
 */
export function AbsenceRecordButton({
  routineId,
  routineName,
}: {
  routineId: string;
  routineName: string;
}) {
  const runtime = useRuntime();

  const [openedAt, setOpenedAt] = useState<DateTime.Zoned | null>(null);

  const [recordedStatus, setRecordedStatus] = useState<null | string>(null);

  function handleOpenForm() {
    setRecordedStatus(null);
    setOpenedAt(runtime.runSync(program()));
  }

  function handleRecord() {
    setOpenedAt(null);
    setRecordedStatus(ABSENCE_MESSAGES.absenceRecordedStatus(routineName));
  }

  return (
    <>
      {openedAt === null ? (
        <Button
          onPress={handleOpenForm}
          title={ABSENCE_MESSAGES.openAbsenceFormButton(routineName)}
        />
      ) : (
        <AbsenceRecordForm
          onCancel={() => {
            setOpenedAt(null);
          }}
          onRecord={handleRecord}
          openedAt={openedAt}
          routineId={routineId}
        />
      )}
      <StatusMessage message={recordedStatus} />
    </>
  );
}
