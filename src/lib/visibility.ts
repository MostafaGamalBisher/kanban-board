/**
 * The index of the item with the largest visible share (0 to 1, as an
 * IntersectionObserver reports it), or `previous` when nothing is visible
 * (e.g. between two observer callbacks). On a tie, the first item wins.
 */
export function mostVisibleIndex(
  ratios: readonly number[],
  previous: number
): number {
  let best = previous;
  let bestRatio = 0;
  ratios.forEach((ratio, index) => {
    if (ratio > bestRatio) {
      best = index;
      bestRatio = ratio;
    }
  });
  return best;
}
