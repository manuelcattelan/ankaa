import { Easing, ReduceMotion } from "react-native-reanimated";

import type { TokenSets } from "#/shared/core/merge-token-sets.ts";

import { mergeTokenSets } from "#/shared/core/merge-token-sets.ts";

// Placeholders until values are chosen. A damping ratio of 1 settles with no
// bounce, and bouncy stays under 0.4 bounce, SwiftUI's bounce being one minus
// the damping ratio
// (https://developer.apple.com/documentation/swiftui/spring/init(duration:bounce:)).
const MOTION_STEPS = {
  bouncyDampingRatio: 0.7,
  longDuration: 500,
  mediumDuration: 350,
  shortDuration: 200,
  smoothDampingRatio: 1,
  snappyDampingRatio: 0.85,
};

// Placeholder: a cubic Bézier, the one easing form that both Easing.bezier and
// CSS-style animations' cubicBezier take, until values are chosen.
const STANDARD_EASING_POINTS = [0.2, 0, 0, 1] as const;

const motionPrimitives = {
  ...MOTION_STEPS,
  standardEasing: Easing.bezier(...STANDARD_EASING_POINTS),
};

type DampingRatioName =
  "bouncyDampingRatio" | "smoothDampingRatio" | "snappyDampingRatio";

type DurationName = "longDuration" | "mediumDuration" | "shortDuration";

type EasingName = "standardEasing";

type SpringRole = {
  dampingRatio: DampingRatioName;
  duration: DurationName;
  reduceMotion: ReduceMotion;
};

type TimingRole = {
  duration: DurationName;
  easing: EasingName;
  reduceMotion: ReduceMotion;
};

type MotionSet = {
  enter: SpringRole | TimingRole;
  exit: SpringRole | TimingRole;
  move: SpringRole;
  stateChange: TimingRole;
};

// Every Role passes ReduceMotion.Never, because Reanimated reads
// ReduceMotion.System only once, at startup, so the Reduce Motion Context
// holds each Role's Reduced motion form instead.
const STATE_CHANGE_ROLE = {
  duration: "shortDuration",
  easing: "standardEasing",
  reduceMotion: ReduceMotion.Never,
} satisfies TimingRole;

const BASE_MOTION_SET: MotionSet = {
  enter: {
    dampingRatio: "snappyDampingRatio",
    duration: "mediumDuration",
    reduceMotion: ReduceMotion.Never,
  },
  exit: {
    dampingRatio: "smoothDampingRatio",
    duration: "shortDuration",
    reduceMotion: ReduceMotion.Never,
  },
  move: {
    dampingRatio: "snappyDampingRatio",
    duration: "mediumDuration",
    reduceMotion: ReduceMotion.Never,
  },
  stateChange: STATE_CHANGE_ROLE,
};

// The Reduced motion forms: an entrance or exit becomes a fade timed like
// stateChange, a move keeps its movement with the smooth damping ratio, and
// stateChange stays the same, following the HIG's "Replacing transitions in
// x-, y-, and z-axes with fades" and "Tightening animation springs"
// (https://developer.apple.com/design/human-interface-guidelines/motion).
const REDUCE_MOTION_ON_MOTION_SET = {
  enter: STATE_CHANGE_ROLE,
  exit: STATE_CHANGE_ROLE,
  move: { ...BASE_MOTION_SET.move, dampingRatio: "smoothDampingRatio" },
} satisfies Partial<MotionSet>;

const MOTION_SETS = {
  base: BASE_MOTION_SET,
  modifiers: {
    reduceMotion: {
      reduceMotionOff: {},
      reduceMotionOn: REDUCE_MOTION_ON_MOTION_SET,
    },
  },
} satisfies TokenSets<MotionSet>;

// A spring takes the duration form, whose duration is perceptual: the spring
// lasts 1.5 times as long
// (https://github.com/software-mansion/react-native-reanimated/blob/4.7.1/packages/react-native-reanimated/src/animation/spring/springConfigs.ts).
function resolveSpringRole(role: SpringRole | TimingRole) {
  if (!("dampingRatio" in role)) {
    throw new Error("A spring Role holds a timing.");
  }

  return {
    dampingRatio: motionPrimitives[role.dampingRatio],
    duration: motionPrimitives[role.duration],
    reduceMotion: role.reduceMotion,
  };
}

function resolveTimingRole(role: SpringRole | TimingRole) {
  if (!("easing" in role)) {
    throw new Error("A timing Role holds a spring.");
  }

  return {
    duration: motionPrimitives[role.duration],
    easing: motionPrimitives[role.easing],
    reduceMotion: role.reduceMotion,
  };
}

const reduceMotionOffMotionSet = mergeTokenSets({
  inputs: { reduceMotion: "reduceMotionOff" },
  sets: MOTION_SETS,
});

const reduceMotionOnMotionSet = mergeTokenSets({
  inputs: { reduceMotion: "reduceMotionOn" },
  sets: MOTION_SETS,
});

/**
 * The motion Token family: duration, damping-ratio and easing steps, and the
 * Roles `enter`, `exit`, `move` and `stateChange`, each a config that
 * `withSpring` or `withTiming` takes, with its explicit `reduceMotion`.
 * Reduce Motion is a live Modifier, so the family exports each Context by
 * name: `useTokens()` selects one from the live flag, and module-level code
 * names the one it needs. A Role resolves to a spring or a timing in each
 * Context, and its resolution throws when the sets hold the other, a defect
 * in this file that must stop the app from starting, as the Resolver's throw
 * on a missing input is.
 */
export const motion = {
  ...motionPrimitives,
  reduceMotionOff: {
    enter: resolveSpringRole(reduceMotionOffMotionSet.enter),
    exit: resolveSpringRole(reduceMotionOffMotionSet.exit),
    move: resolveSpringRole(reduceMotionOffMotionSet.move),
    stateChange: resolveTimingRole(reduceMotionOffMotionSet.stateChange),
  },
  reduceMotionOn: {
    enter: resolveTimingRole(reduceMotionOnMotionSet.enter),
    exit: resolveTimingRole(reduceMotionOnMotionSet.exit),
    move: resolveSpringRole(reduceMotionOnMotionSet.move),
    stateChange: resolveTimingRole(reduceMotionOnMotionSet.stateChange),
  },
};
