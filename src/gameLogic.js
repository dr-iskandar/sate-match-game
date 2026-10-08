export function visualPlayerOrder(picks) {
  return [...picks].reverse();
}

export function isSkewerCorrect(picks, order) {
  if (!Array.isArray(picks) || !Array.isArray(order) || picks.length !== order.length) {
    return false;
  }

  const visualTopToBottom = visualPlayerOrder(picks);
  return visualTopToBottom.every((id, index) => id === order[index]);
}

export function countCorrectPositions(picks, order) {
  if (!Array.isArray(picks) || !Array.isArray(order) || picks.length !== order.length) {
    return 0;
  }

  const visualTopToBottom = visualPlayerOrder(picks);
  return visualTopToBottom.reduce(
    (matches, id, index) => matches + (id === order[index] ? 1 : 0),
    0,
  );
}

export function scoreForMatchedPositions(
  matchedPositions,
  totalPositions,
  multiplier,
  baseScore = 10,
) {
  const safeTotal = Number.isInteger(totalPositions) && totalPositions > 0 ? totalPositions : 1;
  const safeMatches = Number.isFinite(matchedPositions)
    ? Math.min(safeTotal, Math.max(0, Math.floor(matchedPositions)))
    : 0;
  const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  const safeBaseScore = Number.isFinite(baseScore) && baseScore > 0 ? baseScore : 10;

  return Math.round((safeBaseScore * safeMatches * safeMultiplier) / safeTotal);
}

export function scoreForCorrectSkewer(multiplier, baseScore = 10) {
  return scoreForMatchedPositions(1, 1, multiplier, baseScore);
}

export function shouldShowQuiz(correctSkewers, every = 5) {
  return Number.isInteger(correctSkewers)
    && correctSkewers > 0
    && Number.isInteger(every)
    && every > 0
    && correctSkewers % every === 0;
}
