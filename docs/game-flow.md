# Game Flow

## Status

All four screens are built and functional. Notable gaps (Phase 2):
- No auto-advance after awarding a point (host clicks Next manually)
- No game auto-save on each round (save on Game Over only)
- No mid-session resume on page refresh
- No thumbnail grid on Setup screen
- No video duration display

## Screen Map

```
Welcome ────► Setup ────► Game ────► GameOver
  │                          │            │
  └──────────────────────────┴────────────┘
         (new playlist)         (play again)
```

## Step by Step

### Welcome Screen

1. User enters a YouTube playlist URL (e.g. `https://youtube.com/playlist?list=PL...`)
2. User enters their YouTube Data API v3 key (stored in localStorage)
3. App validates the URL format and extracts `playlistId`
4. App checks IndexedDB for a cached version of this playlist
   - If cached and fresh (< 24h): show playlist summary, option to refresh
   - If cached but stale: show cached version + "Refresh from YouTube" button
   - If not cached: fetch from YouTube Data API
5. On successful fetch: store in IndexedDB, navigate to Setup

**Error states:**
- Invalid URL format → inline validation message
- API key invalid/expired → error message with link to Google Cloud Console
- Playlist empty/private → appropriate message
- Network error → retry button, fall back to cached if available

### Setup Screen

1. Shows playlist name and video count (with thumbnail grid)
2. Host adds player names (2–8 players recommended)
   - Text input + "Add" button or Enter key
   - Each player gets a colored badge
   - Remove button per player
3. Optional: Host can edit artist names for individual videos
4. "Start Game" button (disabled until ≥ 2 players added)
5. "Back to Welcome" to choose a different playlist

### Game Screen (Main Gameplay)

**Layout:**
- Top: Now Playing card (album art, title, artist)
- Center: Transport controls
- Bottom: Player scoreboard

**Now Playing Card:**
- Album art displayed with CSS blur filter
- Song title hidden unless host toggles reveal
- Artist hidden unless host toggles reveal
- Track number indicator (e.g. "Song 3 / 25")

**Transport Controls:**
- ▶ Play from start — `seekTo(0)` then `playVideo()`
- ⏵ Play 5s — `seekTo(0)` + play for 5 seconds, then pause
- ⏵ Play 10s — `seekTo(0)` + play for 10 seconds, then pause
- ⏸ Pause — `pauseVideo()`
- ⏮ Previous song — decrement index, restart
- ⏭ Next song — increment index (shuffled order), restart
- Progress bar showing current playback position

**Host Actions:**
- "Award Point" button — opens player selector, awards 1 point
- "Skip" — mark round as no-correct, move to next song
- "Toggle Blur" — unblur/blur album art
- "Reveal" — show/hide title and artist

**Scoring Flow:**
1. Clip plays (host can play/pause/replay as needed)
2. Players call out answers verbally
3. Host decides who answered correctly (or if anyone did)
4. Host taps the player's "+" button on the scoreboard
5. Point awarded, round recorded, auto-advance to next song

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| Space | Play / Pause |
| 5 | Play 5s |
| 0 | Play 10s |
| → | Next song |
| ← | Previous song |
| B | Toggle blur |
| R | Reveal title/artist |
| 1-8 | Award point to player N |

### Game Over Screen

1. Final scoreboard displayed (highest score at top)
2. Crown/medal icon on first place
3. Summary stats: total rounds, correct guesses per player
4. Actions:
   - "Play Again" — reshuffle playlist, reset scores, go to Game screen
   - "New Playlist" — go to Welcome screen
   - "Edit Players" — go to Setup screen

## Shuffle Logic

- When game starts, videos are shuffled into a random order
- Each video appears exactly once per game
- "Previous" goes back in the shuffled order (not the original order)
- "Play Again" reshuffles

## Edge Cases

- **Single video playlist**: After playing, next/previous wraps to itself. Game works but is limited.
- **All songs guessed immediately**: Fine — just tap through quickly.
- **No one guesses correctly**: Host presses "Skip" to record a null round and advance.
- **Player joins mid-game**: Add them in Setup only. No mid-game joining (simplifies scoring).
- **Browser refresh during game**: Game state can be persisted to IndexedDB on each round — offer "Resume Game" on next load.
- **Very long playlist (100+ videos)**: Display paginated. Game ends when all played or host stops.
- **Song repeats**: Each video plays once per game. No repeats unless host manually goes back.
