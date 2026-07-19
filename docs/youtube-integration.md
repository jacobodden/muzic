# YouTube Integration

## Overview

Two separate YouTube APIs are used:

1. **YouTube Data API v3** — Fetch playlist metadata (video list, titles, thumbnails)
2. **YouTube IFrame API** — Embed and control a hidden video player for audio playback

## YouTube Data API v3

### Setup

User must provide a YouTube Data API v3 key:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new API key (or use existing)
3. Enable the "YouTube Data API v3" for the project
4. Copy the key into the app

The key is stored in `localStorage` via Zustand `persist`.

### Endpoint

```
GET https://www.googleapis.com/youtube/v3/playlistItems
  ?part=snippet
  &playlistId={playlistId}
  &maxResults=50
  &key={apiKey}
```

### Pagination

YouTube returns max 50 items per page. The response includes `nextPageToken` if more exist. The app must paginate through all pages to get the full playlist:

```typescript
async function fetchPlaylist(playlistId: string, apiKey: string) {
  let videos: CachedVideo[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    })

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
    const data = await res.json()

    if (data.error) throw new YouTubeApiError(data.error)

    videos.push(...data.items.map(mapPlaylistItem))
    pageToken = data.nextPageToken
  } while (pageToken)

  return videos
}
```

### Response Mapping

```typescript
interface PlaylistItem {
  snippet: {
    title: string
    channelTitle: string
    resourceId: { videoId: string }
    thumbnails: {
      high: { url: string }
      default: { url: string }
    }
  }
}

function mapPlaylistItem(item: PlaylistItem): CachedVideo {
  return {
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle, // editable by host later
    thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.default.url,
  }
}
```

### Error Handling

| Error | Cause | UX |
|-------|-------|----|
| `quotaExceeded` | API key hit daily limit | "API quota exceeded. Try again tomorrow or use a different key." |
| `keyInvalid` | Bad API key | "Invalid API key. Check your Google Cloud Console." |
| `playlistNotFound` | Wrong URL or private | "Playlist not found. Check the URL and make sure it's public." |
| Network error | No internet | "Could not reach YouTube. Check your connection." |

### Quota Management

- Each `playlistItems.list` call costs 1 unit
- Playlist with 100 videos = 2 calls (paginated) = 2 units
- Daily quota: 10,000 units (standard)
- **Cache aggressively** — once fetched, store in IndexedDB. Only re-fetch on explicit user action.

## YouTube IFrame API

### Loading the API

The IFrame API is loaded dynamically by injecting a script tag:

```typescript
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve()
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.onload = () => resolve()
    document.head.appendChild(tag)
  })
}
```

### Creating the Player

```typescript
new YT.Player('player-container', {
  height: '0',
  width: '0',
  playerVars: {
    controls: 0,
    autoplay: 0,
    modestbranding: 1,
    rel: 0,
    fs: 0,
    iv_load_policy: 3,
  },
  events: {
    onReady: onPlayerReady,
    onStateChange: onPlayerStateChange,
    onError: onPlayerError,
  },
})
```

### Player Styling

The player container is hidden from view but still produces audio:

```css
#player-container {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
  pointer-events: none;
}
```

### Transport Controls

```typescript
// Play from start
player.seekTo(0, true)
player.playVideo()

// Play for N seconds (used for 5s / 10s)
player.seekTo(0, true)
player.playVideo()
setTimeout(() => player.pauseVideo(), N * 1000)

// Pause
player.pauseVideo()

// Next song
player.loadVideoById(nextVideoId, 0)

// Previous song
player.loadVideoById(prevVideoId, 0)
```

### Segment Playback Enhancement

To avoid the one-second delay on `seekTo`, cache the player at position 0 after loading:

```typescript
player.loadVideoById(videoId, 0)
// Wait for the video to be buffered at position 0
// Then pause immediately
// Subsequent play calls will be instant
```

### Error Handling

| Error Code | Meaning | UX |
|------------|---------|-----|
| 2 | Invalid video ID | Skip this video, go to next |
| 5 | HTML5 player error (video can't play) | Skip this video |
| 100 | Video not found / removed | Skip this video |
| 101 / 150 | Embedding not allowed | Skip this video |

On error, automatically skip to the next video and log to console.

### Known Limitations

- YouTube IFrame API does not support audio-only mode — we hide the player visually
- Some videos may have embedding disabled — handle gracefully by skipping
- Mobile browsers may require a user gesture before `playVideo()` works — all our play buttons satisfy this
- `seekTo(0, true)` has a slight delay as video buffers — the 5s/10s buttons compensate by being generous with timing
