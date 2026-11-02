/**
 * Gives the most Segments that a recorded Set may have: the Segment count of
 * its matching planned Set's Intensity technique, or 1 without one.
 */
export function getMaximumSegmentCount(plannedSet: {
  intensityTechnique: null | { segmentCount: number };
}) {
  return plannedSet.intensityTechnique?.segmentCount ?? 1;
}
