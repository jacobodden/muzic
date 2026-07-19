# YouTube Integration

Two separate YouTube APIs are used:

1. **YouTube Data API v3** — Fetch playlist metadata (video list, titles, thumbnails)
2. **YouTube IFrame API** — Embed and control a hidden video player for audio playback

## YouTube Data API v3

### Setup

API key is read from `VITE_MUZIC_YT_API_KEY` environment variable:
- Local development: set in `.env.local`
- CI/production builds: set as build secret

Get a key at https://console.cloud.google.com/apis/credentials

### Endpoint

```
GET https://www.googleapis.com/youtube/v3/playlistItems
  ?part=snippet
  &playlistId={playlistId}
  &maxResults=50
  &key={apiKey}
```

### Pagination

YouTube returns max 50 items per page. The app paginates through all pages to get the full playlist, filtering out items without a valid `videoId` (deleted/unavailable videos):

```typescript
async function fetchPlaylistPage(playlistId, apiKey, pageToken?) {
  const params = new URLSearchParams({
    part: 'snippet',
    playlistId,
    maxResults: '50',
    key: apiKey,
  })
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
  const data = await res.json()

  if (data.error) throw new YouTubeApiError(...)

  const videos = (data.items ?? [])
    .filter((item) => item.snippet?.resourceId?.videoId)
    .map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title ?? 'Unknown',
      artist: item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle ?? 'Unknown',
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.default?.url ??
        '',
    }))

  return { videos, nextPageToken: data.nextPageToken }
}
```

### Error Handling

| Error | Cause | UX |
|-------|-------|----|
| `quotaExceeded` | API key hit daily limit | "API quota exceeded. Try again tomorrow or use a different key." |
| `keyInvalid` | Bad API key | "Invalid API key. Check your Google Cloud Console." |
| `playlistNotFound` | Wrong URL or private | "Playlist not found." |
| Network error | No internet | "Could not reach YouTube." |

### Quota

- 1 unit per `playlistItems.list` call
- 100-video playlist = 2 calls = 2 units
- Daily quota: 10,000 units (standard)
- Fetched playlists cached in IndexedDB to minimize API calls

## YouTube IFrame API

### Loading the API

Loaded dynamically, waits for `onYouTubeIframeAPIReady` callback (not script `onload`):

```typescript
let apiPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })

  return apiPromise
}
```

### Creating the Player

```typescript
new YT.Player(container, {
  height: '360',
  width: '640',
  playerVars: {
    controls: 0,
    autoplay: 0,
    modestbranding: 1,
    rel: 0,
    fs: 0,
    iv_load_policy: 3,
  },
  events: {
    onReady: () => setReady(true),
    onStateChange: (e) => setPlaying(e.data === YT.PlayerState.PLAYING),
    onError: () => console.error('Player error'),
  },
})
```

Non-zero dimensions required for YouTube to initialize properly. Player hidden via CSS (`fixed opacity-0 pointer-events-none` on container).

### Transport Controls

```typescript
// Play / Pause toggle
player.playVideo()
player.pauseVideo()

// Play for N seconds from start
player.seekTo(0, true)
player.playVideo()
setTimeout(() => player.pauseVideo(), N * 1000)

// Next / Previous song
player.cueVideoById(videoId)
```

### Error Handling

| Code | Meaning | Handling |
|------|---------|----------|
| 2 | Invalid video ID | Skipped via filter on fetch |
| 5 | HTML5 player error | Logged to console |
| 100 | Video not found / removed | Skipped via filter on fetch |
| 101 / 150 | Embedding not allowed | Skipped via filter on fetch |

### Known Limitations

- YouTube IFrame API does not support audio-only mode — player is hidden visually
- Some videos may have embedding disabled — filtered from playlist on fetch
- Mobile browsers may require a user gesture before `playVideo()` — satisfied by button clicks
- `seekTo(0, true)` has a slight delay as video buffers
