import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";
import { getTrpcErrorCode } from "@/shared/core/get-trpc-error-code";
import { getTrpcErrorMessage } from "@/shared/core/get-trpc-error-message";

export function getRoutineSaveErrorMessage(error: unknown) {
  if (getTrpcErrorCode(error) === "CONFLICT") {
    return routineEditorMessages.routineNameTakenError;
  }

  return getTrpcErrorMessage(error);
}
