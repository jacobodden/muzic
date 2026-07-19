# Component Architecture

## Screen Components (src/components/screens/)

These are the top-level routed views. Only one is rendered at a time based on `useGameStore.screen`.

```
App.tsx
└── screen === 'welcome'  → <WelcomeScreen />
└── screen === 'setup'    → <SetupScreen />
└── screen === 'game'     → <GameScreen />
└── screen === 'gameover' → <GameOverScreen />
```

### `<WelcomeScreen />`
- `PlaylistUrlInput` — text input with URL validation
- `ApiKeyInput` — masked text input, stored via Zustand persist
- `LoadPlaylistButton` — triggers fetch or loads from cache
- `CachedPlaylistBanner` — shows if a cached version exists

### `<SetupScreen />`
- `PlaylistSummary` — playlist name, thumbnail grid, video count
- `PlayerListEditor` — add/remove player names
- `PlayerBadge` — colored badge per player
- `StartGameButton` — disabled until ≥ 2 players

### `<GameScreen />`
- `YouTubePlayer` — hidden IFrame wrapper
- `NowPlaying` — album art (blur toggle), title, artist
- `TransportControls` — play, pause, 5s, 10s, prev, next
- `ProgressBar` — playback progress indicator
- `PlayerScoreboard` — list of players with +1 buttons
- `HostActionBar` — blur toggle, reveal toggle, skip button

### `<GameOverScreen />`
- `FinalScoreboard` — ranked player list with scores
- `SummaryStats` — per-player accuracy stats
- `ActionButtons` — Play Again, New Playlist, Edit Players

## UI Components (src/components/ui/)

Reusable primitives:

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | `variant`, `size`, `onClick`, `disabled` | Styled button |
| `IconButton` | `icon`, `label`, `onClick` | Circular icon button |
| `Modal` | `open`, `onClose`, `title`, `children` | Centered dialog overlay |
| `Input` | `value`, `onChange`, `placeholder`, `error` | Text input |
| `Badge` | `color`, `children` | Colored label/pill |
| `Card` | `children` | Bordered container |
| `Toast` | `message`, `type`, `onDismiss` | Notification toast |

## Custom Hooks (src/hooks/)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useYouTubePlayer(videoId)` | `{ play, pause, seekTo, isReady, isPlaying }` | Manages hidden IFrame player |
| `usePlaySegment(duration)` | `{ playing, play }` | Plays N seconds then pauses |
| `usePlaylist(url)` | `{ playlist, loading, error, fetch }` | Fetches/caches playlist |
| `useKeyboardShortcuts(handlers)` | — | Registers global key handlers |
| `useGamePersistence()` | — | Auto-saves game state to Dexie |

## Data Flow Pattern

```
User Action
    │
    ▼
Component Handler
    │
    ├── calls Zustand action   (e.g. awardPoint(playerId))
    │       │
    │       ├── updates store state
    │       ├── possibly writes to Dexie (async fire-and-forget)
    │       └── triggers re-render
    │
    └── calls hook method     (e.g. playSegment(5))
            │
            └── YouTube IFrame API (e.g. seekTo(0), playVideo())
```

Avoid prop drilling — components read from Zustand stores directly via hooks.

Avoid storing derived data in state — compute from store values in render.
