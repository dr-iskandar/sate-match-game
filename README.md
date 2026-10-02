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

## Visual assets

Gameplay visuals now use lightweight stylized SVG files instead of emoji placeholders:

```text
public/assets/
├── environment/
│   └── skewer-stick.svg
├── ingredients/
│   ├── beef-cube.svg
│   ├── corn-chunk.svg
│   ├── mushroom-slice.svg
│   ├── onion-piece.svg
│   ├── shrimp-piece.svg
│   └── tomato-chunk.svg
└── ui/
    ├── heart-empty.svg
    └── heart-full.svg
```

Ingredient placement uses CSS transform animation, so no frame-based sprite sheet is required for basic pop/bounce motion.

## Audio

The game includes lightweight CC0 audio assets:

- Looping background music starts after the player presses Start, respecting browser autoplay rules.
- Ingredient threading, correct answers, wrong answers, and quiz opening have separate sound cues.
- A sound toggle in the footer persists the player's preference in localStorage.
- Audio provenance and license details are recorded in `public/assets/audio/LICENSES.md`.

## Kang Sate artwork

The portrait gameplay UI uses the provided Kang Sate atlas and optimized WebP sprite sheets. The visual references are `main_screen.webp` and `game over.webp`. The background remains `public/assets/backgrounds/sate-kitchen-bg.webp`.

**Asset installation is required:** binary design uploads are packaged separately from these source-code commits. Extract the supplied `sate-ui-assets.zip` into the repository root and copy your own `Boring Time.otf` into `public/assets/fonts/Boring Time.otf`. Then commit and push the asset folder to serve the art on other devices. Until the art pack is installed, existing ingredient SVGs and simplified fallback controls remain available.

- `public/assets/v2`: sliced ingredient cards, food pieces, mini order icons, HUD panels, Game Over/Home/Reset artwork.
- `public/assets/fx/charcoal_glow.webp`: continuous 9-frame glowing charcoal loop.
- `public/assets/fx/smoke.webp` and `sparkle.webp`: triggered 5-frame effects when a correct skewer/quiz is completed.
- The Game Over panel displays the device's actual top five local scores, stored in localStorage; it is not a server-wide leaderboard.

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

## Same-WiFi development

The Vite dev server is configured to listen on all network interfaces.

```bash
npm run dev:lan
```

Vite will print a Network URL such as:

```text
http://192.168.1.20:5173
```

Open that Network URL from a phone connected to the same Wi-Fi as the laptop. If the phone cannot connect, allow incoming connections for Node/Vite in the laptop firewall and make sure the Wi-Fi does not use client isolation.

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
