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

export function scoreForCorrectSkewer(multiplier, baseScore = 10) {
  const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  const safeBaseScore = Number.isFinite(baseScore) && baseScore > 0 ? baseScore : 10;
  return Math.round(safeBaseScore * safeMultiplier);
}

export function shouldShowQuiz(correctSkewers, every = 5) {
  return Number.isInteger(correctSkewers)
    && correctSkewers > 0
    && Number.isInteger(every)
    && every > 0
    && correctSkewers % every === 0;
}
