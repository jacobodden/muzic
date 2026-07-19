# Game Flow

## Screen Map

```
Welcome ────► Setup ────► Game ────► GameOver
  │                          │            │
  └──────────────────────────┴────────────┘
         (new playlist)         (play again)
```

## Step by Step

### Welcome Screen

1. User enters a YouTube playlist URL
2. App validates the URL format and extracts `playlistId`
3. App checks IndexedDB for a cached version of this playlist
   - If cached and fresh (< 24h): loads immediately, navigates to Setup
   - If not cached or stale: fetches from YouTube Data API
4. On successful fetch: stores in IndexedDB, navigates to Setup
5. API key is read from `VITE_YOUTUBE_API_KEY` env var

**Error states:**
- Missing API key → error message pointing to `.env.local`
- Invalid URL format → inline validation
- API error (quota, bad key, private playlist) → descriptive message
- Empty playlist (all videos filtered out) → "No playable videos found"

### Setup Screen

1. Shows playlist name and song count
2. Host adds player names via text input + Add button or Enter key
3. Each player shown with a colored badge and Remove button
4. Start Game button — enabled once ≥ 2 players added
5. Back button returns to Welcome

### Game Screen (Main Gameplay)

**Layout:**
- Top: Now Playing card (album art, title, artist, track number)
- Center: Transport controls + host actions
- Bottom: Player scoreboard

**Now Playing Card:**
- Album art with blur toggle (Blur Art / Unblur Art button, B key)
- Song title and artist always visible
- Track indicator (e.g. "Song 3 / 25")

**Transport Controls:**
- Play / Pause toggle — starts from beginning or pauses current
- 5s — plays first 5 seconds then pauses
- 10s — plays first 10 seconds then pauses
- Prev — previous song (disabled at first song)
- Next — next song (disabled at last song)

**Host Actions:**
- Blur/Unblur Art — toggle thumbnail blur
- Skip — marks round as no-correct, advances to next song
- Finish Game — appears at last song, navigates to Game Over

**Scoring:**
1. Clip plays (host can replay, skip, or pause as needed)
2. Players call out answers verbally
3. Host decides who answered correctly
4. Host taps player's +1 button to award a point
5. -1 button available to correct accidental awards
6. Host clicks Next to advance

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| Space | Play / Pause |
| 5 | Play 5s |
| 0 | Play 10s |
| → | Next song |
| ← | Previous song |
| B | Toggle blur |

### Game Over Screen

1. Final scoreboard sorted by score (winner highlighted)
2. Rounds played count
3. Actions:
   - Play Again — reshuffle playlist, reset scores, return to Game
   - Edit Players — return to Setup
   - New Playlist — return to Welcome

## Shuffle Logic

- Videos shuffled into random order when game starts
- Each video plays exactly once per game
- Prev/Next navigate the shuffled order
- Play Again reshuffles

## Edge Cases

- **Single video playlist**: Works fine, just one song to guess
- **No one guesses correctly**: Host presses Skip to record a null round and advance
- **Song repeats**: Each video plays once per game
