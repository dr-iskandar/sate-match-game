import './style.css';
import {
  isSkewerCorrect,
  scoreForCorrectSkewer,
  shouldShowQuiz,
} from './gameLogic.js';

const FOODS = [
  { id: 'beef', icon: '🥩', name: { en: 'Beef', id: 'Daging Sapi' } },
  { id: 'tomato', icon: '🍅', name: { en: 'Tomato', id: 'Tomat' } },
  { id: 'mushroom', icon: '🍄', name: { en: 'Mushroom', id: 'Jamur' } },
  { id: 'corn', icon: '🌽', name: { en: 'Corn', id: 'Jagung' } },
  { id: 'onion', icon: '🧅', name: { en: 'Onion', id: 'Bawang' } },
  { id: 'shrimp', icon: '🍤', name: { en: 'Shrimp', id: 'Udang' } },
];

const GAME_DURATION = 60;
const MAX_HEARTS = 5;
const SKEWER_LENGTH = 5;
const BASE_SCORE = 10;
const QUIZ_EVERY = 1;
const QUIZ_MULTIPLIER_STEP = 0.5;

const COPY = {
  en: {
    gameLabel: 'Sate Match game',
    health: 'Health',
    multiplier: 'Multiplier',
    score: 'Score',
    order: 'ORDER',
    top: 'TOP',
    bottom: 'BOTTOM',
    buildUp: 'BUILD ↑',
    ingredients: 'Ingredients',
    time: 'TIME',
    reset: 'RESET',
    title: 'SATE MATCH',
    subtitle: 'Match the order card exactly. Build the skewer from bottom to top.',
    language: 'Language',
    steps: [
      'Read the order card from <strong>top to bottom</strong>.',
      'Build the skewer from <strong>bottom to top</strong> — tap the bottom ingredient first.',
      'Correct skewer: score increases by <strong>10 × multiplier</strong>.',
      'Wrong skewer: lose <strong>1 heart</strong>. Score stays the same.',
      'After <strong>every correct skewer</strong>, a quiz appears.',
      'Correct quiz: multiplier <strong>+0.5</strong>. Wrong quiz: no penalty.',
    ],
    start: 'START GAME',
    startStatus: 'Build from bottom to top. Tap the bottom ingredient first.',
    nextOrder: 'New order! Start from the bottom ingredient.',
    perfect: (gain) => `Perfect skewer! +${gain} points`,
    wrongSkewer: 'Wrong skewer! You lost 1 heart.',
    wrongSkewerToast: 'WRONG SKEWER · -1 HEART',
    pointsToast: (gain) => `+${gain} POINTS`,
    quiz: 'QUIZ',
    quizPrompt: 'Which ingredient is this?',
    quizCorrect: (multiplier) => `Correct! Multiplier increased to ${multiplier}.`,
    quizWrong: (multiplier) => `Wrong! Multiplier stays at ${multiplier}.`,
    quizWrongToast: 'WRONG QUIZ · NO PENALTY',
    multiplierToast: (multiplier) => `MULTIPLIER ${multiplier}`,
    gameOver: 'GAME OVER',
    finalScore: 'FINAL SCORE',
    retry: 'RETRY',
    outOfHearts: 'You ran out of hearts.',
    timeUp: 'Time is up.',
    summary: (reason, correct, multiplier) => `${reason} · ${correct} correct skewers · ${multiplier} multiplier`,
  },
  id: {
    gameLabel: 'Game Sate Match',
    health: 'Nyawa',
    multiplier: 'Pengali',
    score: 'Skor',
    order: 'PESANAN',
    top: 'ATAS',
    bottom: 'BAWAH',
    buildUp: 'SUSUN ↑',
    ingredients: 'Bahan',
    time: 'WAKTU',
    reset: 'ULANG',
    title: 'SATE MATCH',
    subtitle: 'Samakan persis dengan kartu pesanan. Susun sate dari bawah ke atas.',
    language: 'Bahasa',
    steps: [
      'Baca kartu pesanan dari <strong>atas ke bawah</strong>.',
      'Susun sate dari <strong>bawah ke atas</strong> — tekan bahan paling bawah terlebih dahulu.',
      'Sate benar: skor bertambah <strong>10 × multiplier</strong>.',
      'Sate salah: <strong>nyawa berkurang 1</strong>. Skor tetap.',
      'Setelah <strong>setiap sate benar</strong>, quiz akan muncul.',
      'Quiz benar: multiplier <strong>+0.5</strong>. Quiz salah: tidak ada penalti.',
    ],
    start: 'MULAI GAME',
    startStatus: 'Susun dari bawah ke atas. Tekan bahan paling bawah terlebih dahulu.',
    nextOrder: 'Pesanan baru! Mulai dari bahan paling bawah.',
    perfect: (gain) => `Sate benar! +${gain} poin`,
    wrongSkewer: 'Urutan salah! Nyawa berkurang 1.',
    wrongSkewerToast: 'URUTAN SALAH · -1 NYAWA',
    pointsToast: (gain) => `+${gain} POIN`,
    quiz: 'QUIZ',
    quizPrompt: 'Bahan apakah ini?',
    quizCorrect: (multiplier) => `Benar! Multiplier naik menjadi ${multiplier}.`,
    quizWrong: (multiplier) => `Salah! Multiplier tetap ${multiplier}.`,
    quizWrongToast: 'QUIZ SALAH · TANPA PENALTI',
    multiplierToast: (multiplier) => `MULTIPLIER ${multiplier}`,
    gameOver: 'GAME OVER',
    finalScore: 'SKOR AKHIR',
    retry: 'MAIN LAGI',
    outOfHearts: 'Nyawa habis.',
    timeUp: 'Waktu habis.',
    summary: (reason, correct, multiplier) => `${reason} · ${correct} sate benar · multiplier ${multiplier}`,
  },
};

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="app-shell">
    <section class="game-card" id="gameCard" aria-label="Sate Match game">
      <header class="hud">
        <div class="hearts" id="hearts" aria-label="Health"></div>
        <div class="hud-pill"><span id="multiplierLabel">Multiplier</span><strong id="multiplier">×1</strong></div>
        <div class="hud-pill"><span id="scoreLabel">Score</span><strong id="score">0</strong></div>
      </header>

      <section class="play-area" id="playArea">
        <aside class="order-card" id="orderCard" aria-label="Current order">
          <div class="order-title" id="orderTitle">ORDER</div>
          <div class="order-edge" id="orderTop">TOP</div>
          <div class="order-stack" id="orderStack"></div>
          <div class="order-edge" id="orderBottom">BOTTOM</div>
        </aside>

        <div class="build-chip" id="buildChip">BUILD ↑</div>

        <div class="grill-wrap" aria-hidden="true">
          <div class="grill">
            <div class="coal"></div>
            <div class="grid-lines"></div>
            <div class="stick"></div>
            <div class="player-stack" id="playerStack"></div>
          </div>
        </div>

        <div class="status" id="status" aria-live="polite">Build from bottom to top. Tap the bottom ingredient first.</div>

        <div class="ingredients" id="ingredients" aria-label="Ingredients"></div>

        <div class="overlay" id="howToOverlay">
          <div class="panel howto-panel">
            <div class="language-row">
              <span id="languageLabel">Language</span>
              <div class="language-switch" role="group" aria-label="Language">
                <button type="button" class="lang-btn active" data-lang="en" aria-pressed="true">English</button>
                <button type="button" class="lang-btn" data-lang="id" aria-pressed="false">Indonesia</button>
              </div>
            </div>
            <div class="panel-hero">🍢</div>
            <h1 id="gameTitle">SATE MATCH</h1>
            <p class="subtitle" id="subtitle">Match the order card exactly. Build the skewer from bottom to top.</p>
            <div class="steps" id="steps"></div>
            <button class="btn primary start-btn" id="startBtn" type="button">START GAME</button>
          </div>
        </div>

        <div class="overlay hidden" id="quizOverlay">
          <div class="panel quiz-panel">
            <div class="quiz-badge">?</div>
            <h2 id="quizTitle">QUIZ</h2>
            <p id="quizPrompt">Which ingredient is this?</p>
            <div class="quiz-ingredient" id="quizIngredient">🌽</div>
            <div class="quiz-options" id="quizOptions"></div>
            <div class="quiz-result hidden" id="quizResult" aria-live="polite"></div>
          </div>
        </div>

        <div class="overlay hidden" id="gameOverOverlay">
          <div class="panel gameover-panel">
            <h2 id="gameOverTitle">GAME OVER</h2>
            <div class="label" id="finalScoreLabel">FINAL SCORE</div>
            <div class="final-score" id="finalScore">0</div>
            <div class="summary" id="finalSummary"></div>
            <button class="btn primary" id="retryBtn" type="button">RETRY</button>
          </div>
        </div>

        <div class="toast hidden" id="toast" aria-live="polite"></div>
      </section>

      <footer class="footer-bar">
        <div class="time-block">
          <div class="time-row"><span id="timeLabel">TIME</span><strong id="timeText">60s</strong></div>
          <div class="time-bar"><i id="timeBar"></i></div>
        </div>
        <button class="btn primary reset-btn" id="resetBtn" type="button">RESET</button>
      </footer>
    </section>
  </main>
`;

const $ = (selector) => document.querySelector(selector);

const els = {
  gameCard: $('#gameCard'),
  hearts: $('#hearts'),
  multiplierLabel: $('#multiplierLabel'),
  multiplier: $('#multiplier'),
  scoreLabel: $('#scoreLabel'),
  score: $('#score'),
  orderCard: $('#orderCard'),
  orderTitle: $('#orderTitle'),
  orderTop: $('#orderTop'),
  orderBottom: $('#orderBottom'),
  orderStack: $('#orderStack'),
  buildChip: $('#buildChip'),
  playerStack: $('#playerStack'),
  ingredients: $('#ingredients'),
  status: $('#status'),
  howToOverlay: $('#howToOverlay'),
  languageLabel: $('#languageLabel'),
  langButtons: [...document.querySelectorAll('.lang-btn')],
  gameTitle: $('#gameTitle'),
  subtitle: $('#subtitle'),
  steps: $('#steps'),
  startBtn: $('#startBtn'),
  quizOverlay: $('#quizOverlay'),
  quizTitle: $('#quizTitle'),
  quizPrompt: $('#quizPrompt'),
  quizIngredient: $('#quizIngredient'),
  quizOptions: $('#quizOptions'),
  quizResult: $('#quizResult'),
  gameOverOverlay: $('#gameOverOverlay'),
  gameOverTitle: $('#gameOverTitle'),
  finalScoreLabel: $('#finalScoreLabel'),
  finalScore: $('#finalScore'),
  finalSummary: $('#finalSummary'),
  retryBtn: $('#retryBtn'),
  timeLabel: $('#timeLabel'),
  timeText: $('#timeText'),
  timeBar: $('#timeBar'),
  resetBtn: $('#resetBtn'),
  toast: $('#toast'),
};

const state = {
  lang: 'en',
  score: 0,
  hearts: MAX_HEARTS,
  multiplier: 1,
  timeLeft: GAME_DURATION,
  currentOrder: [],
  currentPick: [],
  correctSkewers: 0,
  running: false,
  quizOpen: false,
  timer: null,
  lastEndReasonKey: null,
};

function t(key) {
  return COPY[state.lang][key];
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function foodById(id) {
  return FOODS.find((food) => food.id === id);
}

function foodName(food) {
  return food.name[state.lang];
}

function multiplierLabel(value) {
  return `×${Number.isInteger(value) ? value : value.toFixed(1)}`;
}

function renderSteps() {
  els.steps.innerHTML = '';
  t('steps').forEach((stepText, index) => {
    const step = document.createElement('div');
    step.className = 'step';
    step.innerHTML = `<b>${index + 1}</b><span>${stepText}</span>`;
    els.steps.appendChild(step);
  });
}

function applyLanguage(lang) {
  if (!COPY[lang]) return;
  state.lang = lang;
  document.documentElement.lang = lang === 'id' ? 'id' : 'en';

  els.gameCard.setAttribute('aria-label', t('gameLabel'));
  els.hearts.setAttribute('aria-label', t('health'));
  els.orderCard.setAttribute('aria-label', t('order'));
  els.ingredients.setAttribute('aria-label', t('ingredients'));
  els.multiplierLabel.textContent = t('multiplier');
  els.scoreLabel.textContent = t('score');
  els.orderTitle.textContent = t('order');
  els.orderTop.textContent = t('top');
  els.orderBottom.textContent = t('bottom');
  els.buildChip.textContent = t('buildUp');
  els.languageLabel.textContent = t('language');
  els.gameTitle.textContent = t('title');
  els.subtitle.textContent = t('subtitle');
  els.startBtn.textContent = t('start');
  els.quizTitle.textContent = t('quiz');
  els.quizPrompt.textContent = t('quizPrompt');
  els.gameOverTitle.textContent = t('gameOver');
  els.finalScoreLabel.textContent = t('finalScore');
  els.retryBtn.textContent = t('retry');
  els.timeLabel.textContent = t('time');
  els.resetBtn.textContent = t('reset');

  els.langButtons.forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  renderSteps();
  renderIngredientButtons();
  renderOrder();
  renderPlayerStack();

  if (!state.running && els.gameOverOverlay.classList.contains('hidden')) {
    els.status.textContent = t('startStatus');
  }

  if (!els.gameOverOverlay.classList.contains('hidden') && state.lastEndReasonKey) {
    updateGameOverCopy();
  }
}

function updateHud() {
  els.hearts.innerHTML = '';
  for (let i = 0; i < MAX_HEARTS; i += 1) {
    const heart = document.createElement('span');
    heart.textContent = i < state.hearts ? '❤️' : '♡';
    heart.className = i < state.hearts ? 'heart alive' : 'heart empty';
    els.hearts.appendChild(heart);
  }
  els.multiplier.textContent = multiplierLabel(state.multiplier);
  els.score.textContent = String(state.score);
  els.timeText.textContent = `${state.timeLeft}s`;
  els.timeBar.style.width = `${(state.timeLeft / GAME_DURATION) * 100}%`;
}

function generateOrder() {
  state.currentOrder = Array.from({ length: SKEWER_LENGTH }, () => randomItem(FOODS).id);
  state.currentPick = [];
  renderOrder();
  renderPlayerStack();
}

function renderOrder() {
  els.orderStack.innerHTML = '';
  state.currentOrder.forEach((id) => {
    const food = foodById(id);
    if (!food) return;
    const item = document.createElement('div');
    item.className = 'order-item';
    item.textContent = food.icon;
    item.title = foodName(food);
    els.orderStack.appendChild(item);
  });
}

function renderPlayerStack() {
  els.playerStack.innerHTML = '';
  state.currentPick.forEach((id) => {
    const food = foodById(id);
    if (!food) return;
    const item = document.createElement('div');
    item.className = 'skewer-piece';
    item.textContent = food.icon;
    els.playerStack.appendChild(item);
  });
}

function renderIngredientButtons() {
  els.ingredients.innerHTML = '';
  FOODS.forEach((food) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ingredient-btn';
    button.setAttribute('aria-label', foodName(food));
    button.innerHTML = `<span>${food.icon}</span><small>${foodName(food)}</small>`;
    button.addEventListener('click', () => pickIngredient(food.id));
    els.ingredients.appendChild(button);
  });
}

function showToast(text, type = 'normal') {
  els.toast.className = `toast ${type}`;
  els.toast.textContent = text;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.add('hidden');
  }, 1300);
}

function pickIngredient(id) {
  if (!state.running || state.quizOpen || state.currentPick.length >= SKEWER_LENGTH) return;
  state.currentPick.push(id);
  renderPlayerStack();
  if (state.currentPick.length === SKEWER_LENGTH) {
    setTimeout(resolveSkewer, 180);
  }
}

function resolveSkewer() {
  if (!state.running || state.quizOpen) return;

  // The skewer is physically built from bottom to top. The first tap is rendered
  // at the bottom, so compare the visual top-to-bottom player stack with the
  // top-to-bottom order card instead of comparing raw tap order.
  const correct = isSkewerCorrect(state.currentPick, state.currentOrder);

  if (correct) {
    const gain = scoreForCorrectSkewer(state.multiplier, BASE_SCORE);
    state.score += gain;
    state.correctSkewers += 1;
    updateHud();
    els.status.textContent = t('perfect')(gain);
    showToast(t('pointsToast')(gain), 'success');

    if (shouldShowQuiz(state.correctSkewers, QUIZ_EVERY)) {
      setTimeout(openQuiz, 450);
      return;
    }

    setTimeout(nextOrder, 450);
    return;
  }

  state.hearts = Math.max(0, state.hearts - 1);
  updateHud();
  els.status.textContent = t('wrongSkewer');
  showToast(t('wrongSkewerToast'), 'error');

  if (state.hearts <= 0) {
    setTimeout(() => endGame('outOfHearts'), 450);
    return;
  }

  setTimeout(nextOrder, 550);
}

function nextOrder() {
  if (!state.running) return;
  generateOrder();
  els.status.textContent = t('nextOrder');
}

function openQuiz() {
  if (!state.running) return;
  state.quizOpen = true;
  stopTimer();

  const correctFood = randomItem(FOODS);
  const distractors = shuffle(FOODS.filter((food) => food.id !== correctFood.id)).slice(0, 3);
  const options = shuffle([correctFood, ...distractors]);

  els.quizIngredient.textContent = correctFood.icon;
  els.quizOptions.innerHTML = '';
  els.quizResult.className = 'quiz-result hidden';
  els.quizResult.textContent = '';

  options.forEach((food) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option';
    button.setAttribute('aria-label', foodName(food));
    button.innerHTML = `<span>${food.icon}</span><small>${foodName(food)}</small>`;
    button.addEventListener('click', () => resolveQuiz(food.id === correctFood.id, button));
    els.quizOptions.appendChild(button);
  });

  els.quizOverlay.classList.remove('hidden');
}

function resolveQuiz(correct, selectedButton) {
  if (!state.quizOpen) return;

  const buttons = [...els.quizOptions.querySelectorAll('button')];
  buttons.forEach((button) => { button.disabled = true; });

  if (correct) {
    state.multiplier += QUIZ_MULTIPLIER_STEP;
    selectedButton.classList.add('correct');
    els.quizResult.className = 'quiz-result success';
    els.quizResult.textContent = t('quizCorrect')(multiplierLabel(state.multiplier));
    showToast(t('multiplierToast')(multiplierLabel(state.multiplier)), 'success');
  } else {
    selectedButton.classList.add('wrong');
    els.quizResult.className = 'quiz-result error';
    els.quizResult.textContent = t('quizWrong')(multiplierLabel(state.multiplier));
    showToast(t('quizWrongToast'), 'error');
  }

  updateHud();

  setTimeout(() => {
    els.quizOverlay.classList.add('hidden');
    state.quizOpen = false;
    nextOrder();
    if (state.running) startTimer();
  }, 1100);
}

function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function startTimer() {
  stopTimer();
  state.timer = setInterval(() => {
    if (!state.running || state.quizOpen) return;
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateHud();
    if (state.timeLeft <= 0) endGame('timeUp');
  }, 1000);
}

function startGame() {
  stopTimer();
  Object.assign(state, {
    score: 0,
    hearts: MAX_HEARTS,
    multiplier: 1,
    timeLeft: GAME_DURATION,
    currentOrder: [],
    currentPick: [],
    correctSkewers: 0,
    running: true,
    quizOpen: false,
    lastEndReasonKey: null,
  });

  els.howToOverlay.classList.add('hidden');
  els.quizOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  generateOrder();
  updateHud();
  els.status.textContent = t('startStatus');
  startTimer();
}

function updateGameOverCopy() {
  const reason = t(state.lastEndReasonKey);
  els.finalScore.textContent = String(state.score);
  els.finalSummary.textContent = t('summary')(
    reason,
    state.correctSkewers,
    multiplierLabel(state.multiplier),
  );
}

function endGame(reasonKey) {
  if (!state.running) return;
  state.running = false;
  state.quizOpen = false;
  state.lastEndReasonKey = reasonKey;
  stopTimer();
  updateGameOverCopy();
  els.gameOverOverlay.classList.remove('hidden');
}

els.langButtons.forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.lang));
});
els.startBtn.addEventListener('click', startGame);
els.retryBtn.addEventListener('click', startGame);
els.resetBtn.addEventListener('click', startGame);

renderIngredientButtons();
generateOrder();
updateHud();
applyLanguage('en');
