import type { CachedVideo } from '@/types'

export class YouTubeApiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'YouTubeApiError'
  }
}

async function fetchPlaylistPage(
  playlistId: string,
  apiKey: string,
  pageToken?: string,
): Promise<{ videos: CachedVideo[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    part: 'snippet',
    playlistId,
    maxResults: '50',
    key: apiKey,
  })
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
  const data = await res.json()

  if (data.error) {
    const reason = data.error.errors?.[0]?.reason ?? 'unknown'
    const messages: Record<string, string> = {
      quotaExceeded: 'API quota exceeded. Try again tomorrow or use a different key.',
      keyInvalid: 'Invalid API key. Check your Google Cloud Console.',
      playlistNotFound: 'Playlist not found. Check the URL and make sure it is public.',
    }
    throw new YouTubeApiError(
      messages[reason] ?? data.error.message,
      reason,
    )
  }

  const videos: CachedVideo[] = (data.items ?? []).map((item: any) => ({
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    artist: item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle ?? 'Unknown',
    thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.default.url,
  }))

  return { videos, nextPageToken: data.nextPageToken }
}

export async function fetchPlaylistVideos(
  playlistId: string,
  apiKey: string,
): Promise<CachedVideo[]> {
  let allVideos: CachedVideo[] = []
  let pageToken: string | undefined

  do {
    const result = await fetchPlaylistPage(playlistId, apiKey, pageToken)
    allVideos.push(...result.videos)
    pageToken = result.nextPageToken
  } while (pageToken)

  return allVideos
}

export function extractPlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtube.com' || parsed.hostname === 'www.youtube.com') {
      return parsed.searchParams.get('list')
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.searchParams.get('list')
    }
    return null
  } catch {
    return null
  }
}
