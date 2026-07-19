# Data Model

## IndexedDB Schema (Dexie.js)

```typescript
// db/db.ts
import Dexie, { Table } from 'dexie'

export class AppDB extends Dexie {
  playlists!: Table<CachedPlaylist, string>
  games!: Table<GameSession, string>

  constructor() {
    super('HitMeWithYourBestShot')
    this.version(1).stores({
      playlists: '&playlistId, name, cachedAt',
      games: '&id, createdAt',
    })
  }
}

export const db = new AppDB()
```

## Tables

### `playlists`

```
CachedPlaylist {
  playlistId: string         // primary key (extracted from URL)
  url: string                // original playlist URL
  name: string               // playlist title from YouTube
  videos: CachedVideo[]
  cachedAt: number           // Date.now() when fetched
}

CachedVideo {
  videoId: string            // YouTube video ID
  title: string              // video title
  artist: string             // channel name (editable by host)
  thumbnail: string          // high-res thumbnail URL
  duration: number           // video duration in seconds
}
```

### `games`

```
GameSession {
  id: string                 // auto-generated UUID
  playlistId: string         // references CachedPlaylist
  players: Player[]
  rounds: Round[]
  status: 'setup' | 'playing' | 'finished'
  createdAt: number
  finishedAt?: number
}

Player {
  id: string
  name: string
  score: number
}

Round {
  videoId: string
  correctPlayerId: string | null
  pointsAwarded: number
  timestamp: number
}
```

## Zustand Stores

### `useGameStore` — Current game session

```typescript
interface GameStore {
  screen: 'welcome' | 'setup' | 'game' | 'gameover'
  playlist: CachedPlaylist | null
  players: Player[]
  currentVideoIndex: number
  rounds: Round[]
  scoreboard: { playerId: string; name: string; score: number }[]

  // Actions
  setScreen: (screen: GameStore['screen']) => void
  loadPlaylist: (playlist: CachedPlaylist) => void
  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  nextSong: () => void
  previousSong: () => void
  awardPoint: (playerId: string) => void
  resetGame: () => void
  saveGame: () => Promise<void>
}
```

### `usePlayerStore` — YouTube player state

```typescript
interface PlayerStore {
  isReady: boolean
  isPlaying: boolean
  currentTime: number
  player: YT.Player | null

  setPlayer: (player: YT.Player) => void
  play: () => void
  pause: () => void
  playSegment: (duration: number) => void
  seekToStart: () => void
}
```

### `useSettingsStore` — Persisted settings

```typescript
interface SettingsStore {
  apiKey: string | null
  
  setApiKey: (key: string) => void
  clearApiKey: () => void
}
```

Persisted to `localStorage` via Zustand `persist` middleware.

## localStorage

| Key | Value | Purpose |
|-----|-------|---------|
| `hmwybs-api-key` | string | YouTube Data API key |
| `hmwybs-last-playlist` | string | Last used playlist URL |

Use Zustand `persist` middleware for the settings store — handles serialization automatically.
