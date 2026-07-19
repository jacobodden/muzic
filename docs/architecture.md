# Architecture

## High-Level Data Flow

```
┌─────────────┐     YouTube Data API v3     ┌──────────────────┐
│   YouTube    │ ◄────────────────────────── │  Welcome Screen  │
│   Playlist   │     (fetch video metadata)  │  (user enters    │
│              │                             │   playlist URL)  │
└─────────────┘                             └────────┬─────────┘
                                                     │ store in
                                                     ▼
                                            ┌──────────────────┐
                                            │   IndexedDB      │
                                            │  (Dexie.js)      │
                                            │  - cached videos │
                                            │  - game sessions │
                                            └────────┬─────────┘
                                                     │ read on
                                                     ▼
┌─────────────┐     YouTube IFrame API      ┌──────────────────┐
│   YouTube   │ ◄────────────────────────── │   Game Screen    │
│   Player    │     (seekTo, play, pause)   │  (host controls) │
│  (hidden)   │                             │                  │
└─────────────┘                             └──────────────────┘
```

## Layers

### 1. Data Layer (Dexie.js + IndexedDB)
Persists playlist metadata and game sessions. Provides offline access to previously fetched playlists.

### 2. State Layer (Zustand)
Thin reactive stores for current game session: active screen, current song, player scores, playback state.

### 3. UI Layer (React + Tailwind)
Screen-based navigation (Welcome → Setup → Game → GameOver). Components read from Zustand stores directly.

### 4. YouTube Integration Layer
Two concerns:
- **Data API** (`lib/youtube-api.ts`) — fetches playlist metadata via YouTube Data API v3
- **IFrame API** (`hooks/useYouTubePlayer.ts`) — manages a hidden player instance. Exposes `play`, `pause`, `seekTo`, `playSegment(seconds)`.

## PWA Strategy

### Service Worker (vite-plugin-pwa)
- Precaches all app shell assets (HTML, JS, CSS)
- Cache-first for static assets
- Network-first for YouTube thumbnails

### Offline Capabilities
| Feature | Offline? | Notes |
|---------|----------|-------|
| App shell | ✅ | Cached by SW |
| Playlist browsing | ✅ | Cached in IndexedDB |
| Player setup | ✅ | Local state |
| Score tracking | ✅ | Zustand store |
| Game history | ✅ | Dexie persistence |
| Audio playback | ❌ | Requires YouTube stream |
| New playlist fetch | ❌ | Requires YouTube API |

### Cache Invalidation
- Playlist cache has a `cachedAt` timestamp
- Stale after 24h — re-fetches automatically on next load
- User can force re-fetch by reloading the playlist URL

## Security Considerations

- YouTube API key is set via `VITE_YOUTUBE_API_KEY` env var (`.env.local` for dev, CI secret for builds)
- No user data leaves the device
- No backend, no authentication
- IFrame player is sandboxed by the browser
- Playlist URL is validated before API call
