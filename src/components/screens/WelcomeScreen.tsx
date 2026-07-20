import { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { extractPlaylistId, fetchPlaylistVideos } from '@/lib/youtube-api'
import { db } from '@/db/db'
import type { CachedPlaylist } from '@/types'

const API_KEY = import.meta.env.VITE_MUZIC_YT_API_KEY

export default function WelcomeScreen() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPlaylist = useGameStore((s) => s.loadPlaylist)
  const setScreen = useGameStore((s) => s.setScreen)
  const { lastPlaylistUrl, setLastPlaylistUrl } = useSettingsStore()

  const loadUrl = useCallback(async (urlToLoad: string) => {
    setError(null)

    if (!API_KEY) {
      setError('YouTube API key is not configured. Set VITE_MUZIC_YT_API_KEY in your .env.local file.')
      return
    }

    const playlistId = extractPlaylistId(urlToLoad)
    if (!playlistId) {
      setError('Invalid YouTube playlist URL.')
      return
    }

    setLastPlaylistUrl(urlToLoad)
    setLoading(true)

    try {
      const cached = await db.playlists.get(playlistId)
      const isFresh = cached && Date.now() - cached.cachedAt < 86400000

      if (isFresh) {
        loadPlaylist(cached)
        setScreen('setup')
        return
      }

      const videos = await fetchPlaylistVideos(playlistId, API_KEY)

      if (videos.length === 0) {
        setError('No playable videos found in this playlist.')
        return
      }

      const playlistName = `${videos.length} songs loaded`
      const playlist: CachedPlaylist = {
        playlistId,
        url: urlToLoad,
        name: playlistName,
        videos,
        cachedAt: Date.now(),
      }

      await db.playlists.put(playlist)
      loadPlaylist(playlist)
      setScreen('setup')
    } catch (err: any) {
      setError(err.message ?? 'Failed to load playlist.')
    } finally {
      setLoading(false)
    }
  }, [loadPlaylist, setScreen, setLastPlaylistUrl])

  const handleLoad = useCallback(() => loadUrl(url.trim()), [loadUrl, url])

  const handleLoadLast = useCallback(() => {
    if (lastPlaylistUrl) {
      setUrl(lastPlaylistUrl)
      loadUrl(lastPlaylistUrl)
    }
  }, [lastPlaylistUrl, loadUrl])

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Tune In</h1>
        <p className="text-center text-brand-text">
          Enter a YouTube playlist URL to start
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">YouTube Playlist URL</label>
            <input
              className="w-full rounded bg-brand-dark border border-brand-light px-3 py-2"
              placeholder="https://youtube.com/playlist?list=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            className="w-full rounded bg-brand-mid px-4 py-2 font-semibold hover:bg-brand-light disabled:opacity-50"
            onClick={handleLoad}
            disabled={loading || !url.trim()}
          >
            {loading ? 'Loading...' : 'Load Playlist'}
          </button>
        </div>

        {lastPlaylistUrl && (
          <div className="text-center">
            <button
              className="text-xs text-brand-muted hover:text-brand-text underline transition-colors"
              onClick={handleLoadLast}
              disabled={loading}
            >
              Load last playlist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
