import { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics";

// expo-haptics plays each kind of pattern through its own function:
// notificationAsync(type), impactAsync(style) and selectionAsync(), which
// takes no value (https://docs.expo.dev/versions/v58.0.0/sdk/haptics/), so
// each pattern names its kind.
type HapticPattern =
  | { kind: "impact"; style: ImpactFeedbackStyle }
  | { kind: "notification"; type: NotificationFeedbackType }
  | { kind: "selection" };

/**
 * The haptics Token family: Apple's nine Haptic patterns, named by the
 * meaning the HIG gives each one, each resolving to the expo-haptics value
 * that plays it. Play a pattern only for its meaning, never as the only
 * feedback, never on a control that plays system haptics, and at the
 * intensity of the animation it accompanies. Users turn haptics off in the
 * system setting, so the family has no Contexts.
 */
export const haptics = {
  error: { kind: "notification", type: NotificationFeedbackType.Error },
  heavyImpact: { kind: "impact", style: ImpactFeedbackStyle.Heavy },
  lightImpact: { kind: "impact", style: ImpactFeedbackStyle.Light },
  mediumImpact: { kind: "impact", style: ImpactFeedbackStyle.Medium },
  rigidImpact: { kind: "impact", style: ImpactFeedbackStyle.Rigid },
  selection: { kind: "selection" },
  softImpact: { kind: "impact", style: ImpactFeedbackStyle.Soft },
  success: { kind: "notification", type: NotificationFeedbackType.Success },
  warning: { kind: "notification", type: NotificationFeedbackType.Warning },
} satisfies Record<string, HapticPattern>;
