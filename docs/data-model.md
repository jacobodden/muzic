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
  name: string               // display name (e.g. "25 songs loaded")
  videos: CachedVideo[]
  cachedAt: number           // Date.now() when fetched
}

CachedVideo {
  videoId: string            // YouTube video ID
  title: string              // video title
  artist: string             // channel name
  thumbnail: string          // high-res thumbnail URL
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
  shuffledIds: string[]
  players: Player[]
  currentVideoIndex: number
  rounds: Round[]
  albumArtBlurred: boolean

  setScreen: (screen: Screen) => void
  loadPlaylist: (playlist: CachedPlaylist) => void
  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  setPlayers: (players: Player[]) => void
  nextSong: () => void
  previousSong: () => void
  awardPoint: (playerId: string) => void
  removePoint: (playerId: string) => void
  skipRound: () => void
  toggleBlur: () => void
  resetGame: () => void
  getCurrentVideoId: () => string | null
  getStandings: () => Player[]
}
```

### `usePlayerStore` — YouTube player state

```typescript
interface PlayerStore {
  isReady: boolean
  isPlaying: boolean

  setReady: (ready: boolean) => void
  setPlaying: (playing: boolean) => void
}
```

### `useSettingsStore` — Persisted settings

```typescript
interface SettingsStore {
  lastPlaylistUrl: string | null

  setLastPlaylistUrl: (url: string) => void
}
```

Persisted to `localStorage` via Zustand `persist` middleware under key `hmwybs-settings`.

## Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `VITE_YOUTUBE_API_KEY` | `.env.local` / CI secret | YouTube Data API v3 key |
