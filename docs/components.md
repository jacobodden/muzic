# Component Architecture

## Screen Components (src/components/screens/)

Top-level routed views. Rendered based on `useGameStore.screen`.

```
App.tsx
└── screen === 'welcome'  → <WelcomeScreen />
└── screen === 'setup'    → <SetupScreen />
└── screen === 'game'     → <GameScreen />
└── screen === 'gameover' → <GameOverScreen />
```

### `<WelcomeScreen />`
- Playlist URL input with URL validation
- Load button — fetches from YouTube API or loads from IndexedDB cache
- Error display for invalid URL, missing API key, empty playlists, network errors

### `<SetupScreen />`
- Playlist summary card (name, video count)
- Player list editor — add/remove player names with colored badges
- Start Game button (disabled until ≥ 2 players)

### `<GameScreen />`
- Hidden YouTube IFrame player (audio only)
- Now Playing card — album art (blur toggle), title and artist toggleable (hidden by default)
- Transport controls — Play/Pause toggle, 5s, 10s, Prev, Next
- Host actions — Show/Hide Title, Blur/Unblur Art, Finish Game (last song only)
- Player scoreboard — name, score, -1 and +1 buttons per player

### `<GameOverScreen />`
- Ranked scoreboard with winner highlighted
- Rounds played count
- Action buttons — Play Again, Edit Players, New Playlist

## Custom Hooks (src/hooks/)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useYouTubePlayer(videoId)` | `{ containerRef, play, pause, playSegment, seekToStart }` | Manages hidden IFrame player |
| `useKeyboardShortcuts(shortcuts)` | — | Registers global key handlers |

### `useYouTubePlayer` details
- Loads YouTube IFrame API via `onYouTubeIframeAPIReady` callback
- Creates player with 640x360 dimensions (hidden via CSS `opacity-0 pointer-events-none`)
- Caches API load promise to handle React StrictMode double-mount
- Exposes `play()`, `pause()`, `playSegment(seconds)`, `seekToStart()`
- Player lifecycle managed via `playerStore` (ready, playing states)

## Data Flow Pattern

```
User Action (click / keyboard)
    │
    ▼
Component Handler
    │
    ├── calls Zustand action   (e.g. awardPoint(playerId))
    │       │
    │       └── updates store → triggers re-render
    │
    └── calls hook method     (e.g. playSegment(5))
            │
            └── YouTube IFrame API (seekTo, playVideo)
```

Components read directly from Zustand stores via hooks — no prop drilling.
