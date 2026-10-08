import './style.css';
import {
  applyHeartPenalty,
  countCorrectPositions,
  heartFillStates,
  scoreForMatchedPositions,
  shouldShowQuiz,
} from './gameLogic.js';

const FOODS = [
  { id: 'beef', asset: '/assets/v2/food-beef.webp', fallback: '/assets/ingredients/beef-cube.svg', card: '/assets/v2/card-beef.webp', mini: '/assets/v2/order-beef.webp', name: { en: 'Beef', id: 'Daging Sapi' } },
  { id: 'tomato', asset: '/assets/v2/food-tomato.webp', fallback: '/assets/ingredients/tomato-chunk.svg', card: '/assets/v2/card-tomato.webp', mini: '/assets/v2/order-tomato.webp', name: { en: 'Tomato', id: 'Tomat' } },
  { id: 'mushroom', asset: '/assets/v2/food-mushroom.webp', fallback: '/assets/ingredients/mushroom-slice.svg', card: '/assets/v2/card-mushroom.webp', mini: '/assets/v2/order-mushroom.webp', name: { en: 'Mushroom', id: 'Jamur' } },
  { id: 'corn', asset: '/assets/v2/food-corn.webp', fallback: '/assets/ingredients/corn-chunk.svg', card: '/assets/v2/card-corn.webp', mini: '/assets/v2/order-corn.webp', name: { en: 'Corn', id: 'Jagung' } },
  { id: 'onion', asset: '/assets/v2/food-onion.webp', fallback: '/assets/ingredients/onion-piece.svg', card: '/assets/v2/card-onion.webp', mini: '/assets/v2/order-onion.webp', name: { en: 'Onion', id: 'Bawang' } },
  { id: 'shrimp', asset: '/assets/v2/food-shrimp.webp', fallback: '/assets/ingredients/shrimp-piece.svg', card: '/assets/v2/card-shrimp.webp', mini: '/assets/v2/order-shrimp.webp', name: { en: 'Shrimp', id: 'Udang' } },
];

const GAME_DURATION = 60;
const MAX_HEARTS = 5;
const SKEWER_LENGTH = 5;
const BASE_SCORE = 10;
const QUIZ_EVERY = 1;
const QUIZ_MULTIPLIER_STEP = 0.5;
const SOUND_STORAGE_KEY = 'sate-match:sound-enabled';
const HIGH_SCORES_KEY = 'sate-match:local-highscores';

const AUDIO_PATHS = {
  bgm: '/assets/audio/bgm.mp3',
  thread: '/assets/audio/ingredient-thread.wav',
  success: '/assets/audio/success.wav',
  error: '/assets/audio/error.wav',
  quiz: '/assets/audio/quiz.wav',
};

const AUDIO_VOLUMES = {
  bgm: 0.18,
  thread: 0.42,
  success: 0.5,
  error: 0.42,
  quiz: 0.38,
};

const bgm = new Audio(AUDIO_PATHS.bgm);
bgm.loop = true;
bgm.preload = 'auto';
bgm.volume = AUDIO_VOLUMES.bgm;

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
    resetStatus: 'Current skewer cleared. Keep following the same order.',
    home: 'HOME',
    localBest: 'LOCAL BEST',
    runLabel: 'RUN',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    title: 'SATE MATCH',
    subtitle: 'Match the order card exactly. Build the skewer from bottom to top.',
    language: 'Language',
    steps: [
      'Read the order card from <strong>top to bottom</strong>.',
      'Build the skewer from <strong>bottom to top</strong> — tap the bottom ingredient first.',
      'Each ingredient in the <strong>correct position</strong> earns points. A perfect skewer is worth <strong>10 × multiplier</strong>.',
      'An imperfect skewer still earns partial points, but costs <strong>½ heart</strong>.',
      'After <strong>every perfect skewer</strong>, a quiz appears.',
      'Correct quiz: multiplier <strong>+0.5</strong>. Wrong quiz: no penalty.',
    ],
    start: 'START GAME',
    startStatus: 'Build from bottom to top. Tap the bottom ingredient first.',
    nextOrder: 'New order! Start from the bottom ingredient.',
    perfect: (gain) => `Perfect skewer! +${gain} points`,
    partialSkewer: (matches, gain) => `${matches}/5 positions correct · +${gain} points · -½ heart`,
    partialSkewerToast: (matches, gain) => `${matches}/5 CORRECT · +${gain} · -½ HEART`,
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
    resetStatus: 'Susunan sate saat ini dihapus. Pesanan tetap sama.',
    home: 'BERANDA',
    localBest: 'TERBAIK LOKAL',
    runLabel: 'MAIN',
    soundOn: 'Suara aktif',
    soundOff: 'Suara mati',
    title: 'SATE MATCH',
    subtitle: 'Samakan persis dengan kartu pesanan. Susun sate dari bawah ke atas.',
    language: 'Bahasa',
    steps: [
      'Baca kartu pesanan dari <strong>atas ke bawah</strong>.',
      'Susun sate dari <strong>bawah ke atas</strong> — tekan bahan paling bawah terlebih dahulu.',
      'Setiap bahan di <strong>posisi yang benar</strong> memberi poin. Sate sempurna bernilai <strong>10 × multiplier</strong>.',
      'Sate yang belum sempurna tetap mendapat poin parsial, tetapi kehilangan <strong>½ hati</strong>.',
      'Setelah <strong>setiap sate sempurna</strong>, quiz akan muncul.',
      'Quiz benar: multiplier <strong>+0.5</strong>. Quiz salah: tidak ada penalti.',
    ],
    start: 'MULAI GAME',
    startStatus: 'Susun dari bawah ke atas. Tekan bahan paling bawah terlebih dahulu.',
    nextOrder: 'Pesanan baru! Mulai dari bahan paling bawah.',
    perfect: (gain) => `Sate sempurna! +${gain} poin`,
    partialSkewer: (matches, gain) => `${matches}/5 posisi benar · +${gain} poin · -½ hati`,
    partialSkewerToast: (matches, gain) => `${matches}/5 BENAR · +${gain} · -½ HATI`,
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

// Until the art pack is installed, retain usable fallback controls.
const artProbe = new Image();
artProbe.onload = () => document.documentElement.classList.add('kangsate-art-loaded');
artProbe.onerror = () => document.documentElement.classList.add('kangsate-art-missing');
artProbe.src = '/assets/v2/gameover-panel.webp';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="app-shell">
    <section class="game-card" id="gameCard" aria-label="Sate Match game">
      <header class="hud">
        <div class="hearts-frame"><div class="hearts" id="hearts" aria-label="Health"></div></div>
        <div class="score-frame">
          <div class="hud-pill multiplier-pill"><span id="multiplierLabel">Multiplier</span><strong id="multiplier">×1</strong></div>
          <div class="score-divider"></div>
          <div class="hud-pill score-pill"><span id="scoreLabel">Score</span><strong id="score">0</strong></div>
        </div>
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
            <div class="charcoal-viewport" aria-hidden="true"><div class="charcoal-frames"></div></div>
            <div class="wooden-skewer" aria-hidden="true"></div>
            <div class="player-stack" id="playerStack"></div>
            <div class="fx-sprite smoke-fx" id="smokeFx" aria-hidden="true"><div class="fx-frames"></div></div>
            <div class="fx-sprite sparkle-fx" id="sparkleFx" aria-hidden="true"><div class="fx-frames"></div></div>
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
            <div class="panel-hero" aria-hidden="true"><img src="/assets/v2/food-beef.webp" alt="" /><img src="/assets/v2/food-tomato.webp" alt="" /><img src="/assets/v2/food-shrimp.webp" alt="" /></div>
            <h1 id="gameTitle">SATE MATCH</h1>
            <p class="subtitle" id="subtitle">Match the order card exactly. Build the skewer from bottom to top.</p>
            <div class="steps" id="steps"></div>
            <button class="btn primary start-btn" id="startBtn" type="button">START GAME</button>
          </div>
        </div>

        <button class="btn reset-btn" id="resetBtn" type="button" aria-label="Reset" title="Reset"></button>

        <div class="overlay hidden" id="quizOverlay">
          <div class="panel quiz-panel">
            <div class="quiz-badge">?</div>
            <h2 id="quizTitle">QUIZ</h2>
            <p id="quizPrompt">Which ingredient is this?</p>
            <div class="quiz-ingredient" id="quizIngredient"></div>
            <div class="quiz-options" id="quizOptions"></div>
            <div class="quiz-result hidden" id="quizResult" aria-live="polite"></div>
          </div>
        </div>

        <div class="overlay hidden" id="gameOverOverlay">
          <div class="panel gameover-panel">
            <h2 class="sr-only" id="gameOverTitle">GAME OVER</h2>
            <div class="gameover-content">
              <div class="label" id="finalScoreLabel">FINAL SCORE</div>
              <div class="final-score" id="finalScore">0</div>
              <div class="leaderboard-label" id="leaderboardLabel">LOCAL BEST</div>
              <div class="leaderboard" id="leaderboard"></div>
              <div class="summary" id="finalSummary"></div>
            </div>
            <button class="btn primary retry-btn" id="retryBtn" type="button">RETRY</button>
            <button class="home-btn" id="homeBtn" type="button" aria-label="Home" title="Home">HOME</button>
          </div>
        </div>

        <div class="toast hidden" id="toast" aria-live="polite"></div>
      </section>

      <footer class="footer-bar">
        <div class="time-block">
          <div class="time-bar"><i id="timeBar"></i></div>
        </div>
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
  smokeFx: $('#smokeFx'),
  sparkleFx: $('#sparkleFx'),
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
  leaderboardLabel: $('#leaderboardLabel'),
  leaderboard: $('#leaderboard'),
  finalSummary: $('#finalSummary'),
  retryBtn: $('#retryBtn'),
  homeBtn: $('#homeBtn'),
  timeLabel: $('#timeLabel'),
  timeText: $('#timeText'),
  timeBar: $('#timeBar'),
  resetBtn: $('#resetBtn'),
  soundBtn: $('#soundBtn'),
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
  pendingSkewerResolution: null,
  soundEnabled: readSoundPreference(),
  highScores: readHighScores(),
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

function foodImageMarkup(food, className = 'food-art', variant = 'asset') {
  const src = food[variant] || food.asset;
  return `<img class="${className}" src="${src}" data-fallback="${food.fallback}" alt="${foodName(food)}" draggable="false" />`;
}

document.addEventListener('error', (event) => {
  if (!(event.target instanceof HTMLImageElement)) return;
  const image = event.target;
  if (!image.dataset.fallback || image.src.endsWith(image.dataset.fallback)) return;
  image.src = image.dataset.fallback;
}, true);

function multiplierLabel(value) {
  return `×${Number.isInteger(value) ? value : value.toFixed(1)}`;
}

function readHighScores() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((n) => Number.isFinite(n) && n >= 0).slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

function recordHighScore(value) {
  state.highScores = [...state.highScores, value]
    .sort((a, b) => b - a)
    .slice(0, 5);
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(state.highScores));
  } catch {
    // Local scoreboard remains available for the current session.
  }
}

function renderLeaderboard() {
  els.leaderboardLabel.textContent = t('localBest');
  els.leaderboard.innerHTML = '';
  state.highScores.forEach((score, index) => {
    const line = document.createElement('div');
    line.className = 'leaderboard-row';
    const name = document.createElement('span');
    name.textContent = `${t('runLabel')} ${index + 1}`;
    const points = document.createElement('strong');
    points.textContent = String(score);
    line.append(name, points);
    els.leaderboard.appendChild(line);
  });
}

function readSoundPreference() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function storeSoundPreference(enabled) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Ignore storage restrictions; audio still works for the current session.
  }
}

function playSfx(name) {
  if (!state.soundEnabled || !AUDIO_PATHS[name]) return;

  const clip = new Audio(AUDIO_PATHS[name]);
  clip.preload = 'auto';
  clip.volume = AUDIO_VOLUMES[name] ?? 0.45;
  clip.play().catch(() => {
    // Browser audio can be blocked until the first trusted user interaction.
  });
}

function playBgm({ restart = false } = {}) {
  if (!state.soundEnabled || !state.running) return;
  if (restart) bgm.currentTime = 0;
  bgm.play().catch(() => {
    // Start/retry is a user gesture, but silently tolerate stricter autoplay policies.
  });
}

function stopBgm({ reset = false } = {}) {
  bgm.pause();
  if (reset) bgm.currentTime = 0;
}

function updateSoundButton() {
  if (!els.soundBtn) return;
  const enabled = state.soundEnabled;
  els.soundBtn.textContent = enabled ? '🔊' : '🔇';
  els.soundBtn.setAttribute('aria-pressed', String(enabled));
  els.soundBtn.setAttribute('aria-label', enabled ? t('soundOn') : t('soundOff'));
  els.soundBtn.title = enabled ? t('soundOn') : t('soundOff');
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  storeSoundPreference(state.soundEnabled);
  updateSoundButton();

  if (state.soundEnabled) {
    playSfx('thread');
    playBgm();
  } else {
    stopBgm();
  }
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
  els.homeBtn.setAttribute('aria-label', t('home'));
  els.homeBtn.title = t('home');
  if (els.timeLabel) els.timeLabel.textContent = t('time');
  els.resetBtn.textContent = t('reset');
  els.resetBtn.setAttribute('aria-label', t('reset'));
  updateSoundButton();

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
  heartFillStates(state.hearts, MAX_HEARTS).forEach((stateName) => {
    const slot = document.createElement('span');
    slot.className = `heart-slot ${stateName}`;

    const emptyHeart = document.createElement('img');
    emptyHeart.src = '/assets/ui/heart-empty.svg';
    emptyHeart.alt = '';
    emptyHeart.className = 'heart heart-empty-base';
    emptyHeart.draggable = false;
    slot.appendChild(emptyHeart);

    if (stateName !== 'empty') {
      const fillHeart = document.createElement('img');
      fillHeart.src = '/assets/v2/heart-full.webp';
      fillHeart.alt = '';
      fillHeart.className = 'heart heart-fill';
      fillHeart.draggable = false;
      fillHeart.addEventListener('error', () => {
        fillHeart.onerror = null;
        fillHeart.src = '/assets/ui/heart-full.svg';
      }, { once: true });
      slot.appendChild(fillHeart);
    }

    els.hearts.appendChild(slot);
  });
  els.hearts.setAttribute('aria-label', `${t('health')}: ${state.hearts}/${MAX_HEARTS}`);
  els.multiplier.textContent = multiplierLabel(state.multiplier);
  els.score.textContent = String(state.score);
  if (els.timeText) els.timeText.textContent = `${state.timeLeft}s`;
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
    item.title = foodName(food);
    item.innerHTML = foodImageMarkup(food, 'order-food-art', 'mini');
    els.orderStack.appendChild(item);
  });
}

function createSkewerPiece(id, slotIndex, animate = false) {
  const food = foodById(id);
  if (!food) return null;

  const item = document.createElement('div');
  item.className = animate ? 'skewer-piece entering' : 'skewer-piece';
  item.style.setProperty('--slot-index', String(slotIndex));
  item.innerHTML = foodImageMarkup(food, 'skewer-food-art');

  if (animate) {
    const stackHeight = els.playerStack.clientHeight || 200;
    const dropDistance = Math.max(24, stackHeight * (0.9 - slotIndex * 0.205));
    item.style.setProperty('--drop-distance', `${dropDistance}px`);
  }

  return item;
}

function renderPlayerStack() {
  els.playerStack.innerHTML = '';
  state.currentPick.forEach((id, slotIndex) => {
    const item = createSkewerPiece(id, slotIndex);
    if (item) els.playerStack.appendChild(item);
  });
}

function appendPlayerPiece(id) {
  const slotIndex = state.currentPick.length - 1;
  const item = createSkewerPiece(id, slotIndex, true);
  if (item) els.playerStack.appendChild(item);
}

function renderIngredientButtons() {
  els.ingredients.innerHTML = '';
  FOODS.forEach((food) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ingredient-btn';
    button.setAttribute('aria-label', foodName(food));
    button.innerHTML = `${foodImageMarkup(food, 'ingredient-food-art', 'card')}<small>${foodName(food)}</small>`;
    button.addEventListener('click', () => pickIngredient(food.id));
    els.ingredients.appendChild(button);
  });
}

function replaySprite(element, lifetime) {
  if (!element) return;
  element.classList.remove('playing');
  void element.offsetWidth;
  element.classList.add('playing');
  clearTimeout(element.fxTimer);
  element.fxTimer = setTimeout(() => element.classList.remove('playing'), lifetime);
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
  playSfx('thread');
  state.currentPick.push(id);
  appendPlayerPiece(id);

  if (state.currentPick.length === SKEWER_LENGTH) {
    clearTimeout(state.pendingSkewerResolution);
    state.pendingSkewerResolution = setTimeout(() => {
      state.pendingSkewerResolution = null;
      resolveSkewer();
    }, 420);
  }
}

function resetCurrentSkewer() {
  if (!state.running || state.quizOpen) return;

  clearTimeout(state.pendingSkewerResolution);
  state.pendingSkewerResolution = null;
  state.currentPick = [];
  renderPlayerStack();
  els.status.textContent = t('resetStatus');
}

function resolveSkewer() {
  if (!state.running || state.quizOpen) return;

  const matchedPositions = countCorrectPositions(state.currentPick, state.currentOrder);
  const correct = matchedPositions === SKEWER_LENGTH;
  const gain = scoreForMatchedPositions(
    matchedPositions,
    SKEWER_LENGTH,
    state.multiplier,
    BASE_SCORE,
  );

  state.score += gain;

  if (correct) {
    state.correctSkewers += 1;
    updateHud();
    playSfx('success');
    replaySprite(els.smokeFx, 950);
    replaySprite(els.sparkleFx, 850);
    els.status.textContent = t('perfect')(gain);
    showToast(t('pointsToast')(gain), 'success');

    if (shouldShowQuiz(state.correctSkewers, QUIZ_EVERY)) {
      setTimeout(openQuiz, 1200);
      return;
    }

    setTimeout(nextOrder, 850);
    return;
  }

  state.hearts = applyHeartPenalty(state.hearts, 0.5);
  updateHud();
  playSfx('error');
  els.status.textContent = t('partialSkewer')(matchedPositions, gain);
  showToast(t('partialSkewerToast')(matchedPositions, gain), gain > 0 ? 'normal' : 'error');

  if (state.hearts <= 0) {
    setTimeout(() => endGame('outOfHearts'), 450);
    return;
  }

  setTimeout(nextOrder, 700);
}

function nextOrder() {
  if (!state.running) return;
  clearTimeout(state.pendingSkewerResolution);
  state.pendingSkewerResolution = null;
  generateOrder();
  els.status.textContent = t('nextOrder');
}

function openQuiz() {
  if (!state.running) return;
  state.quizOpen = true;
  stopTimer();
  playSfx('quiz');

  const correctFood = randomItem(FOODS);
  const distractors = shuffle(FOODS.filter((food) => food.id !== correctFood.id)).slice(0, 3);
  const options = shuffle([correctFood, ...distractors]);

  els.quizIngredient.innerHTML = foodImageMarkup(correctFood, 'quiz-food-art');
  els.quizOptions.innerHTML = '';
  els.quizResult.className = 'quiz-result hidden';
  els.quizResult.textContent = '';

  options.forEach((food) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option';
    button.setAttribute('aria-label', foodName(food));
    button.innerHTML = `${foodImageMarkup(food, 'quiz-option-art')}<small>${foodName(food)}</small>`;
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
    playSfx('success');
    replaySprite(els.sparkleFx, 850);
    state.multiplier += QUIZ_MULTIPLIER_STEP;
    selectedButton.classList.add('correct');
    els.quizResult.className = 'quiz-result success';
    els.quizResult.textContent = t('quizCorrect')(multiplierLabel(state.multiplier));
    showToast(t('multiplierToast')(multiplierLabel(state.multiplier)), 'success');
  } else {
    playSfx('error');
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
  els.smokeFx.classList.remove('playing');
  els.sparkleFx.classList.remove('playing');
  stopTimer();
  clearTimeout(state.pendingSkewerResolution);
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
    pendingSkewerResolution: null,
  });

  els.howToOverlay.classList.add('hidden');
  els.quizOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  generateOrder();
  updateHud();
  els.status.textContent = t('startStatus');
  startTimer();
  playBgm({ restart: true });
}

function updateGameOverCopy() {
  const reason = t(state.lastEndReasonKey);
  els.finalScore.textContent = String(state.score);
  renderLeaderboard();
  els.finalSummary.textContent = t('summary')(
    reason,
    state.correctSkewers,
    multiplierLabel(state.multiplier),
  );
}

function endGame(reasonKey) {
  if (!state.running) return;
  els.smokeFx.classList.remove('playing');
  els.sparkleFx.classList.remove('playing');
  clearTimeout(state.pendingSkewerResolution);
  state.pendingSkewerResolution = null;
  state.running = false;
  state.quizOpen = false;
  state.lastEndReasonKey = reasonKey;
  stopTimer();
  stopBgm({ reset: true });
  recordHighScore(state.score);
  updateGameOverCopy();
  els.gameOverOverlay.classList.remove('hidden');
}

els.langButtons.forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.lang));
});
els.startBtn.addEventListener('click', startGame);
els.retryBtn.addEventListener('click', startGame);
els.resetBtn.addEventListener('click', resetCurrentSkewer);
if (els.soundBtn) els.soundBtn.addEventListener('click', toggleSound);
els.homeBtn.addEventListener('click', () => {
  stopTimer();
  stopBgm({ reset: true });
  clearTimeout(state.pendingSkewerResolution);
  state.pendingSkewerResolution = null;
  state.running = false;
  state.quizOpen = false;
  state.lastEndReasonKey = null;
  els.gameOverOverlay.classList.add('hidden');
  els.quizOverlay.classList.add('hidden');
  els.howToOverlay.classList.remove('hidden');
  els.status.textContent = t('startStatus');
});

renderIngredientButtons();
generateOrder();
updateHud();
applyLanguage('en');
