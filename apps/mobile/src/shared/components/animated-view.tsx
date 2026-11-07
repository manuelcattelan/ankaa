import type { ComponentProps } from "react";

import animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAccessibilityFlags } from "#/shared/hooks/use-accessibility-flags.ts";
import { motion } from "#/shared/tokens/motion.ts";

function createFade({
  fade,
  role,
}: {
  fade: typeof FadeIn | typeof FadeOut;
  role: typeof motion.reduceMotionOn.stateChange;
}) {
  return fade
    .duration(role.duration)
    .easing(role.easing)
    .reduceMotion(role.reduceMotion);
}

// Built once at module level, because a static builder call creates a new
// instance while an instance modifier changes the instance it's called on, so
// a modifier called on a shared builder would change it for every user
// (https://github.com/software-mansion/react-native-reanimated/blob/4.7.1/packages/react-native-reanimated/src/layoutReanimation/animationBuilder/BaseAnimationBuilder.ts).
const enterReducedMotionForm = createFade({
  fade: FadeIn,
  role: motion.reduceMotionOn.enter,
});

const exitReducedMotionForm = createFade({
  fade: FadeOut,
  role: motion.reduceMotionOn.exit,
});

/**
 * Reanimated's `Animated.View`, the one view that takes `entering` and
 * `exiting`, which it swaps for the Reduced motion form of `motion.enter` and
 * `motion.exit`, a fade, while Reduce Motion is on. Reanimated reads
 * `entering` only when the view mounts and ignores `.duration(0)`, so the
 * swap happens here, from the live flag.
 */
export function AnimatedView(props: ComponentProps<typeof animated.View>) {
  const accessibilityFlags = useAccessibilityFlags();

  return (
    <animated.View
      {...props}
      {...(accessibilityFlags.isReduceMotionEnabled &&
      props.entering !== undefined
        ? { entering: enterReducedMotionForm }
        : {})}
      {...(accessibilityFlags.isReduceMotionEnabled &&
      props.exiting !== undefined
        ? { exiting: exitReducedMotionForm }
        : {})}
    />
  );
}
