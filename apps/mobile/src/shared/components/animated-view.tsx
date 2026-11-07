import type { ComponentProps } from "react";

import { use } from "react";
import animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";
import { motion } from "#/shared/tokens/motion.ts";

// Built once at module level, because a static builder call creates a new
// instance while an instance modifier changes the instance it's called on, so
// a modifier called on a shared builder would change it for every user
// (https://github.com/software-mansion/react-native-reanimated/blob/4.7.1/packages/react-native-reanimated/src/layoutReanimation/animationBuilder/BaseAnimationBuilder.ts).
const enterReducedMotionForm = FadeIn.duration(
  motion.reduceMotionOn.enter.duration,
)
  .easing(motion.reduceMotionOn.enter.easing)
  .reduceMotion(motion.reduceMotionOn.enter.reduceMotion);

const exitReducedMotionForm = FadeOut.duration(
  motion.reduceMotionOn.exit.duration,
)
  .easing(motion.reduceMotionOn.exit.easing)
  .reduceMotion(motion.reduceMotionOn.exit.reduceMotion);

/**
 * Reanimated's `Animated.View`, the one view that takes `entering` and
 * `exiting`, which it swaps for the Reduced motion form of `motion.enter` and
 * `motion.exit`, a fade, while Reduce Motion is on. Reanimated reads
 * `entering` only when the view mounts and ignores `.duration(0)`, so the
 * swap happens here, from the live flag.
 */
export function AnimatedView(props: ComponentProps<typeof animated.View>) {
  const accessibilityFlags = use(AccessibilityFlagsContext);

  const isReduceMotionEnabled =
    accessibilityFlags?.isReduceMotionEnabled === true;

  return (
    <animated.View
      {...props}
      {...(isReduceMotionEnabled && props.entering !== undefined
        ? { entering: enterReducedMotionForm }
        : {})}
      {...(isReduceMotionEnabled && props.exiting !== undefined
        ? { exiting: exitReducedMotionForm }
        : {})}
    />
  );
}
