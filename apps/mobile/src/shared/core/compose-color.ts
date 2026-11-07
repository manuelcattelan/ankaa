const MAXIMUM_ALPHA = 255;

const HEXADECIMAL_RADIX = 16;

const ALPHA_DIGIT_COUNT = 2;

/**
 * Composes a color primitive, a six-digit hex color, with an opacity
 * primitive into the eight-digit hex color that React Native takes, so a
 * translucent color needs no alpha ramp
 * (https://reactnative.dev/docs/colors#red-green-blue-rgb).
 */
export function composeColor({
  color,
  opacity,
}: {
  color: string;
  opacity: number;
}) {
  const alpha = Math.round(opacity * MAXIMUM_ALPHA)
    .toString(HEXADECIMAL_RADIX)
    .padStart(ALPHA_DIGIT_COUNT, "0");

  return `${color}${alpha}`;
}
