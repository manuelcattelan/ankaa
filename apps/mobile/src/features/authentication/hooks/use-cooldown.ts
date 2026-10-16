import { useEffect, useState } from "react";

import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";

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
  const cooldownRemainingSeconds = Math.max(
    0,
    Math.ceil((cooldownDeadline - cooldownNow) / MILLISECONDS_PER_SECOND),
  );

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
      cooldownStart + cooldownSeconds * MILLISECONDS_PER_SECOND,
    );
  }

  function stopCooldown() {
    setCooldownDeadline(cooldownNow);
  }

  return [cooldownRemainingSeconds, startCooldown, stopCooldown] as const;
}
