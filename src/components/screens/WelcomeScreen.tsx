import { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { extractPlaylistId, fetchPlaylistVideos } from '@/lib/youtube-api'
import { db } from '@/db/db'
import type { CachedPlaylist } from '@/types'

export default function WelcomeScreen() {
  const [url, setUrl] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPlaylist = useGameStore((s) => s.loadPlaylist)
  const setScreen = useGameStore((s) => s.setScreen)
  const { apiKey, lastPlaylistUrl, setApiKey, setLastPlaylistUrl } = useSettingsStore()

  const displayKey = apiKey ?? apiKeyInput

  const handleLoad = useCallback(async () => {
    setError(null)

    const key = displayKey.trim()
    if (!key) {
      setError('Please enter a YouTube Data API key.')
      return
    }

    const playlistId = extractPlaylistId(url.trim())
    if (!playlistId) {
      setError('Invalid YouTube playlist URL.')
      return
    }

    if (!apiKey) setApiKey(key)
    setLastPlaylistUrl(url.trim())
    setLoading(true)

    try {
      const cached = await db.playlists.get(playlistId)
      const isFresh = cached && Date.now() - cached.cachedAt < 86400000

      if (isFresh) {
        loadPlaylist(cached)
        setScreen('setup')
        return
      }

      const videos = await fetchPlaylistVideos(playlistId, key)

      const playlistName = `${videos.length} songs loaded`
      const playlist: CachedPlaylist = {
        playlistId,
        url: url.trim(),
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
  }, [url, displayKey, apiKey, loadPlaylist, setScreen, setApiKey, setLastPlaylistUrl])

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Hit Me With Your Best Shot</h1>
        <p className="text-center text-gray-400">
          Enter a YouTube playlist and start the game
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">YouTube Playlist URL</label>
            <input
              className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2"
              placeholder="https://youtube.com/playlist?list=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              YouTube Data API Key
              {apiKey && <span className="text-green-400 ml-2">(saved)</span>}
            </label>
            <input
              className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2"
              type="password"
              placeholder="AIza..."
              value={apiKeyInput || apiKey || ''}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            onClick={handleLoad}
            disabled={loading || !url.trim()}
          >
            {loading ? 'Loading...' : 'Load Playlist'}
          </button>
        </div>

        {lastPlaylistUrl && (
          <p className="text-xs text-gray-500 text-center">
            Last playlist: {lastPlaylistUrl}
          </p>
        )}
      </div>
    </div>
  )
}
