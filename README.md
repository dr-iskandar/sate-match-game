# Sate Match Game

Mobile-portrait web game prototype for matching satay/skewer orders.

## Current gameplay

- Read the order card from **top to bottom**.
- Build the real skewer from **bottom to top** by tapping the bottom ingredient first.
- Correct skewer: score increases by `10 × current multiplier`.
- Wrong skewer: lose 1 heart; score is unchanged.
- Every correct skewer awards points and immediately leads to a quiz.
- Correct quiz: multiplier `+0.5`.
- Wrong quiz: no penalty.
- Countdown pauses as soon as the quiz opens and resumes only after the quiz has been answered and closed.
- English and Indonesian are selectable before the game starts.

## Mobile-first layout

The game is designed for portrait phones. On desktop, it stays centered in a mobile-sized frame instead of expanding to desktop width.

## Stack and dependencies

- Vanilla JavaScript
- HTML/CSS
- Vite `7.1.7` as the only development dependency
- Node.js `>=20.19.0`
- No runtime framework or third-party gameplay dependency

## Run

```bash
npm install
npm run dev
```

## Validate

```bash
npm run check
```

The check command runs gameplay unit tests plus JavaScript syntax validation.

## Build

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
    ├── gameLogic.js
    ├── gameLogic.test.js
    ├── main.js
    └── style.css
```
