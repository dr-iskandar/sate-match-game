import './style.css';

const FOODS = [
  { id: 'beef', icon: '🥩', name: 'Beef' },
  { id: 'tomato', icon: '🍅', name: 'Tomato' },
  { id: 'mushroom', icon: '🍄', name: 'Mushroom' },
  { id: 'corn', icon: '🌽', name: 'Corn' },
  { id: 'onion', icon: '🧅', name: 'Onion' },
  { id: 'shrimp', icon: '🍤', name: 'Shrimp' },
];

const GAME_DURATION = 60;
const MAX_HEARTS = 5;
const SKEWER_LENGTH = 5;
const BASE_SCORE = 10;
const QUIZ_EVERY = 5;
const QUIZ_MULTIPLIER_STEP = 0.5;

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="app-shell">
    <section class="game-card" aria-label="Sate Match game">
      <header class="hud">
        <div class="hearts" id="hearts" aria-label="Health"></div>
        <div class="hud-pill"><span>Multiplier</span><strong id="multiplier">×1</strong></div>
        <div class="hud-pill"><span>Score</span><strong id="score">0</strong></div>
      </header>

      <section class="play-area" id="playArea">
        <aside class="order-card" aria-label="Current order">
          <div class="order-title">ORDER</div>
          <div class="order-stack" id="orderStack"></div>
        </aside>

        <div class="grill-wrap" aria-hidden="true">
          <div class="grill">
            <div class="coal"></div>
            <div class="grid-lines"></div>
            <div class="stick"></div>
            <div class="player-stack" id="playerStack"></div>
          </div>
        </div>

        <div class="status" id="status" aria-live="polite">Match the order from top to bottom.</div>

        <div class="ingredients" id="ingredients" aria-label="Ingredients"></div>

        <div class="overlay" id="howToOverlay">
          <div class="panel howto-panel">
            <div class="panel-hero">🍢</div>
            <h1>SATE MATCH</h1>
            <p class="subtitle">Build the skewer in the same order as the customer's order.</p>
            <div class="steps">
              <div class="step"><b>1</b><span>Tap 5 ingredients in the correct order.</span></div>
              <div class="step"><b>2</b><span>Correct skewer: score increases by <strong>10 × multiplier</strong>.</span></div>
              <div class="step"><b>3</b><span>Wrong skewer: lose <strong>1 heart</strong>. Score stays the same.</span></div>
              <div class="step"><b>4</b><span>Every <strong>5 correct skewers</strong>, a quiz appears.</span></div>
              <div class="step"><b>5</b><span>Correct quiz: multiplier <strong>+0.5</strong>.</span></div>
              <div class="step"><b>6</b><span>Wrong quiz: no penalty and no multiplier increase.</span></div>
            </div>
            <button class="btn primary" id="startBtn" type="button">START GAME</button>
          </div>
        </div>

        <div class="overlay hidden" id="quizOverlay">
          <div class="panel quiz-panel">
            <div class="quiz-badge">?</div>
            <h2>QUIZ</h2>
            <p>Which ingredient is this?</p>
            <div class="quiz-ingredient" id="quizIngredient">🌽</div>
            <div class="quiz-options" id="quizOptions"></div>
            <div class="quiz-result hidden" id="quizResult" aria-live="polite"></div>
          </div>
        </div>

        <div class="overlay hidden" id="gameOverOverlay">
          <div class="panel gameover-panel">
            <h2>GAME OVER</h2>
            <div class="label">FINAL SCORE</div>
            <div class="final-score" id="finalScore">0</div>
            <div class="summary" id="finalSummary"></div>
            <button class="btn primary" id="retryBtn" type="button">RETRY</button>
          </div>
        </div>

        <div class="toast hidden" id="toast" aria-live="polite"></div>
      </section>

      <footer class="footer-bar">
        <div class="time-block">
          <div class="time-row"><span>TIME</span><strong id="timeText">60s</strong></div>
          <div class="time-bar"><i id="timeBar"></i></div>
        </div>
        <button class="btn secondary" id="helpBtn" type="button">HOW TO PLAY</button>
        <button class="btn primary" id="resetBtn" type="button">RESET</button>
      </footer>
    </section>
  </main>
`;

const $ = (selector) => document.querySelector(selector);

const els = {
  hearts: $('#hearts'),
  multiplier: $('#multiplier'),
  score: $('#score'),
  orderStack: $('#orderStack'),
  playerStack: $('#playerStack'),
  ingredients: $('#ingredients'),
  status: $('#status'),
  howToOverlay: $('#howToOverlay'),
  startBtn: $('#startBtn'),
  quizOverlay: $('#quizOverlay'),
  quizIngredient: $('#quizIngredient'),
  quizOptions: $('#quizOptions'),
  quizResult: $('#quizResult'),
  gameOverOverlay: $('#gameOverOverlay'),
  finalScore: $('#finalScore'),
  finalSummary: $('#finalSummary'),
  retryBtn: $('#retryBtn'),
  timeText: $('#timeText'),
  timeBar: $('#timeBar'),
  helpBtn: $('#helpBtn'),
  resetBtn: $('#resetBtn'),
  toast: $('#toast'),
};

const state = {
  score: 0,
  hearts: MAX_HEARTS,
  multiplier: 1,
  timeLeft: GAME_DURATION,
  currentOrder: [],
  currentPick: [],
  correctSkewers: 0,
  running: false,
  quizOpen: false,
  pausedForHelp: false,
  timer: null,
};

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

function multiplierLabel(value) {
  return `×${Number.isInteger(value) ? value : value.toFixed(1)}`;
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
    const item = document.createElement('div');
    item.className = 'order-item';
    item.textContent = food.icon;
    item.title = food.name;
    els.orderStack.appendChild(item);
  });
}

function renderPlayerStack() {
  els.playerStack.innerHTML = '';
  state.currentPick.forEach((id) => {
    const food = foodById(id);
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
    button.innerHTML = `<span>${food.icon}</span><small>${food.name}</small>`;
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

  const isCorrect = state.currentPick.every((id, index) => id === state.currentOrder[index]);

  if (isCorrect) {
    const gain = Math.round(BASE_SCORE * state.multiplier);
    state.score += gain;
    state.correctSkewers += 1;
    updateHud();
    els.status.textContent = `Perfect skewer! +${gain} points`;
    showToast(`+${gain} POINTS`, 'success');

    if (state.correctSkewers % QUIZ_EVERY === 0) {
      setTimeout(openQuiz, 450);
      return;
    }

    setTimeout(nextOrder, 450);
    return;
  }

  state.hearts -= 1;
  updateHud();
  els.status.textContent = 'Wrong skewer! You lost 1 heart.';
  showToast('WRONG SKEWER · -1 HEART', 'error');

  if (state.hearts <= 0) {
    setTimeout(() => endGame('You ran out of hearts.'), 450);
    return;
  }

  setTimeout(nextOrder, 550);
}

function nextOrder() {
  if (!state.running) return;
  generateOrder();
  els.status.textContent = 'New order! Match it from top to bottom.';
}

function openQuiz() {
  if (!state.running) return;
  state.quizOpen = true;

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
    button.innerHTML = `<span>${food.icon}</span><small>${food.name}</small>`;
    button.addEventListener('click', () => resolveQuiz(food.id === correctFood.id, button));
    els.quizOptions.appendChild(button);
  });

  els.quizOverlay.classList.remove('hidden');
}

function resolveQuiz(isCorrect, selectedButton) {
  if (!state.quizOpen) return;
  state.quizOpen = false;

  const buttons = [...els.quizOptions.querySelectorAll('button')];
  buttons.forEach((button) => { button.disabled = true; });

  if (isCorrect) {
    state.multiplier += QUIZ_MULTIPLIER_STEP;
    selectedButton.classList.add('correct');
    els.quizResult.className = 'quiz-result success';
    els.quizResult.textContent = `Correct! Multiplier increased to ${multiplierLabel(state.multiplier)}.`;
    showToast(`MULTIPLIER ${multiplierLabel(state.multiplier)}`, 'success');
  } else {
    selectedButton.classList.add('wrong');
    els.quizResult.className = 'quiz-result error';
    els.quizResult.textContent = `Wrong! Multiplier stays at ${multiplierLabel(state.multiplier)}.`;
    showToast('WRONG QUIZ · NO PENALTY', 'error');
  }

  updateHud();

  setTimeout(() => {
    els.quizOverlay.classList.add('hidden');
    nextOrder();
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
    if (!state.running || state.quizOpen || state.pausedForHelp) return;
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateHud();
    if (state.timeLeft <= 0) endGame('Time is up.');
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
    pausedForHelp: false,
  });

  els.howToOverlay.classList.add('hidden');
  els.quizOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  generateOrder();
  updateHud();
  els.status.textContent = 'Match the order from top to bottom.';
  startTimer();
}

function endGame(reason) {
  if (!state.running) return;
  state.running = false;
  state.quizOpen = false;
  stopTimer();
  els.finalScore.textContent = String(state.score);
  els.finalSummary.textContent = `${reason} · ${state.correctSkewers} correct skewers · ${multiplierLabel(state.multiplier)} multiplier`;
  els.gameOverOverlay.classList.remove('hidden');
}

function openHelp() {
  if (state.running) state.pausedForHelp = true;
  els.startBtn.textContent = state.running ? 'RESUME GAME' : 'START GAME';
  els.howToOverlay.classList.remove('hidden');
}

function closeHelpOrStart() {
  if (state.running && state.pausedForHelp) {
    state.pausedForHelp = false;
    els.howToOverlay.classList.add('hidden');
    els.startBtn.textContent = 'START GAME';
    return;
  }
  startGame();
}

els.startBtn.addEventListener('click', closeHelpOrStart);
els.retryBtn.addEventListener('click', startGame);
els.resetBtn.addEventListener('click', startGame);
els.helpBtn.addEventListener('click', openHelp);

renderIngredientButtons();
generateOrder();
updateHud();
