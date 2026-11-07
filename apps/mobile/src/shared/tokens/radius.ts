// Placeholders until values are chosen. capsule is larger than any view, and
// React Native clamps a radius to half the view's shorter side, which draws a
// Capsule, while '50%' would draw an ellipse on a view that isn't square.
const RADIUS_PRIMITIVES = {
  capsule: 9999,
  lg: 16,
  md: 12,
  sm: 8,
  xl: 24,
  xs: 4,
};

/**
 * The radius Token family: corner radii, each of which but `radius.capsule`
 * pairs with `borderCurve: 'continuous'`. A Concentric radius joins it as a
 * Semantic token computed with `computeConcentricRadius` once a shape is
 * nested in another. No setting changes a radius, so the family has no
 * Contexts.
 */
export const radius = RADIUS_PRIMITIVES;
