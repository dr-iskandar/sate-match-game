# Sate Match Game

A mobile-first web game prototype inspired by casual cooking / skewer matching mechanics.

## Gameplay rules

- Player builds a 5-ingredient skewer by tapping ingredients.
- Correct skewer: score increases by `10 × current multiplier`.
- Wrong skewer: lose 1 heart. Score does not decrease.
- Every 5 correct skewers, a quiz appears.
- Correct quiz answer: multiplier increases by `+0.5`.
- Wrong quiz answer: no penalty and multiplier stays the same.
- Game ends when time reaches zero or all hearts are lost.

## Stack

- Vite
- Vanilla JavaScript
- HTML/CSS
- No backend required

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
sate-match-game/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.js
    └── style.css
```

## Next recommended steps

- Replace emoji placeholders with generated transparent PNG/WebP assets.
- Add sound effects and background music.
- Move gameplay rendering to Phaser if more advanced animation, particles, physics, or a growing library of mini-games is needed.
- Add leaderboard / participant identity via API when required.
