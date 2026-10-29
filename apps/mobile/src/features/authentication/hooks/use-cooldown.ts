import { useEffect, useState } from "react";

import { getCooldownDeadline } from "#/features/authentication/core/get-cooldown-deadline.ts";
import { getRemainingSeconds } from "#/shared/core/get-remaining-seconds.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";

type UseCooldownOptions = {
  cooldownEndMessage: string;
  getCooldownInitialDeadline?: () => number;
};

const COOLDOWN_INTERVAL_MILLISECONDS = 1_000;

export function useCooldown({
  cooldownEndMessage,
  getCooldownInitialDeadline = Date.now,
}: UseCooldownOptions) {
  const runtime = useRuntime();

  const [cooldownDeadline, setCooldownDeadline] = useState(
    getCooldownInitialDeadline,
  );
  const [cooldownNow, setCooldownNow] = useState(Date.now);

  const isCooldownActive = cooldownNow < cooldownDeadline;
  const cooldownRemainingSeconds = getRemainingSeconds({
    currentTime: cooldownNow,
    deadline: cooldownDeadline,
  });

  useEffect(() => {
    if (!isCooldownActive) {
      return;
    }

    const cooldownInterval = setInterval(() => {
      const cooldownTickTime = Date.now();

      setCooldownNow(cooldownTickTime);

      if (cooldownTickTime >= cooldownDeadline) {
        clearInterval(cooldownInterval);
        runtime.runSync(announceMessage(cooldownEndMessage));
      }
    }, COOLDOWN_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(cooldownInterval);
    };
  }, [cooldownDeadline, cooldownEndMessage, isCooldownActive, runtime]);

  function startCooldown(cooldownSeconds: number) {
    const cooldownStart = Date.now();

    setCooldownNow(cooldownStart);

    setCooldownDeadline(
      getCooldownDeadline({ cooldownSeconds, cooldownStart }),
    );
  }

  function stopCooldown() {
    setCooldownDeadline(cooldownNow);
  }

  return [cooldownRemainingSeconds, startCooldown, stopCooldown] as const;
}
