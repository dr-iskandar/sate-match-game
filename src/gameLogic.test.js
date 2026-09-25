import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSkewerCorrect,
  scoreForCorrectSkewer,
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

test('score uses current multiplier', () => {
  assert.equal(scoreForCorrectSkewer(1), 10);
  assert.equal(scoreForCorrectSkewer(1.5), 15);
  assert.equal(scoreForCorrectSkewer(2), 20);
});

test('quiz triggers every fifth correct skewer', () => {
  assert.equal(shouldShowQuiz(4), false);
  assert.equal(shouldShowQuiz(5), true);
  assert.equal(shouldShowQuiz(10), true);
  assert.equal(shouldShowQuiz(0), false);
});
