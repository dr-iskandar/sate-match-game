import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countCorrectPositions,
  isSkewerCorrect,
  scoreForCorrectSkewer,
  scoreForMatchedPositions,
  shouldShowQuiz,
  visualPlayerOrder,
} from './gameLogic.js';

test('visual player stack is read top-to-bottom by reversing tap order', () => {
  assert.deepEqual(visualPlayerOrder(['shrimp', 'onion', 'corn']), ['corn', 'onion', 'shrimp']);
});

test('bottom-to-top tap sequence matches a top-to-bottom order card', () => {
  const order = ['beef', 'tomato', 'corn', 'onion', 'shrimp'];
  const taps = ['shrimp', 'onion', 'corn', 'tomato', 'beef'];
  assert.equal(isSkewerCorrect(taps, order), true);
});

test('top-to-bottom tapping is not accepted when building from bottom to top', () => {
  const order = ['beef', 'tomato', 'corn', 'onion', 'shrimp'];
  assert.equal(isSkewerCorrect(order, order), false);
});

test('wrong ingredient sequence is rejected', () => {
  const order = ['beef', 'tomato', 'corn', 'onion', 'shrimp'];
  const taps = ['shrimp', 'onion', 'beef', 'tomato', 'beef'];
  assert.equal(isSkewerCorrect(taps, order), false);
});

test('correct-position count follows visual top-to-bottom positions', () => {
  const order = ['beef', 'tomato', 'corn', 'onion', 'shrimp'];

  assert.equal(
    countCorrectPositions(['shrimp', 'onion', 'corn', 'tomato', 'beef'], order),
    5,
  );
  assert.equal(
    countCorrectPositions(['shrimp', 'onion', 'beef', 'tomato', 'beef'], order),
    4,
  );
  assert.equal(
    countCorrectPositions(['beef', 'beef', 'beef', 'beef', 'beef'], order),
    1,
  );
});

test('partial score is proportional to matching positions and current multiplier', () => {
  assert.equal(scoreForMatchedPositions(0, 5, 1), 0);
  assert.equal(scoreForMatchedPositions(1, 5, 1), 2);
  assert.equal(scoreForMatchedPositions(2, 5, 1), 4);
  assert.equal(scoreForMatchedPositions(3, 5, 1.5), 9);
  assert.equal(scoreForMatchedPositions(4, 5, 2), 16);
  assert.equal(scoreForMatchedPositions(5, 5, 2), 20);
});

test('full score uses current multiplier', () => {
  assert.equal(scoreForCorrectSkewer(1), 10);
  assert.equal(scoreForCorrectSkewer(1.5), 15);
  assert.equal(scoreForCorrectSkewer(2), 20);
});

test('quiz can trigger after every fully correct skewer', () => {
  assert.equal(shouldShowQuiz(1, 1), true);
  assert.equal(shouldShowQuiz(2, 1), true);
  assert.equal(shouldShowQuiz(5, 1), true);
  assert.equal(shouldShowQuiz(0, 1), false);
});
