# Architecture

## High-Level Data Flow

```
┌─────────────┐     YouTube Data API v3     ┌──────────────────┐
│   YouTube    │ ◄────────────────────────── │  Welcome Screen  │
│   Playlist   │     (fetch video metadata)  │  (user provides  │
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
Persists playlist metadata, game sessions, player history. Provides offline access to previously fetched playlists.

### 2. State Layer (Zustand)
Lightweight reactive stores for current game session: active screen, current song, player scores, playback state. Zustand stores hydrate from and persist to Dexie.

### 3. UI Layer (React + Tailwind)
Screen-based navigation (Welcome → Setup → Game → GameOver). Components are thin — mostly read from Zustand and dispatch actions.

### 4. YouTube Integration Layer
Two concerns:
- **Data API** (`lib/youtube-api.ts`) — fetches playlist metadata. Called once per playlist load.
- **IFrame API** (`hooks/useYouTubePlayer.ts`) — manages a hidden player instance. Exposes `play`, `pause`, `seekTo`, `playSegment(seconds)`.

## PWA Strategy

### Service Worker (vite-plugin-pwa)
- Precaches all app shell assets (HTML, JS, CSS, fonts)
- Cache-first strategy for static assets
- Network-first for YouTube thumbnails (fallback to placeholder)

### Offline Capabilities
| Feature | Offline? | Notes |
|---------|----------|-------|
| App shell | ✅ | Cached by SW |
| Playlist browsing | ✅ | Cached in IndexedDB |
| Player setup | ✅ | Local state |
| Score tracking | ✅ | Local state + Dexie |
| Game history | ✅ | Dexie persistence |
| Audio playback | ❌ | Requires YouTube stream |
| New playlist fetch | ❌ | Requires YouTube API |

### Cache Invalidation
- Playlist cache has a `cachedAt` timestamp
- Stale after 24h — show "Refresh Playlist" option to user
- User can force re-fetch at any time

## Security Considerations

- YouTube API key is stored in `localStorage` — scoped to the origin
- No user data leaves the device
- No backend, no authentication, no network requests except to YouTube
- IFrame player is sandboxed by the browser
- Validate playlist URL format before API call (`youtube.com/playlist?list=...`)
