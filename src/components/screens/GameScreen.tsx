import { useCallback, useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function GameScreen() {
  const playlist = useGameStore((s) => s.playlist)
  const players = useGameStore((s) => s.players)
  const currentVideoIndex = useGameStore((s) => s.currentVideoIndex)
  const shuffledIds = useGameStore((s) => s.shuffledIds)
  const albumArtBlurred = useGameStore((s) => s.albumArtBlurred)

  const nextSong = useGameStore((s) => s.nextSong)
  const previousSong = useGameStore((s) => s.previousSong)
  const awardPoint = useGameStore((s) => s.awardPoint)
  const removePoint = useGameStore((s) => s.removePoint)
  const skipRound = useGameStore((s) => s.skipRound)
  const toggleBlur = useGameStore((s) => s.toggleBlur)
  const setScreen = useGameStore((s) => s.setScreen)

  const videoId = shuffledIds[currentVideoIndex] ?? null
  const { containerRef, play, pause, playSegment } = useYouTubePlayer(videoId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  const currentVideo = useMemo(() => {
    if (!playlist || !videoId) return null
    return playlist.videos.find((v) => v.videoId === videoId) ?? null
  }, [playlist, videoId])

  const atStart = currentVideoIndex === 0
  const atEnd = currentVideoIndex >= shuffledIds.length - 1

  const handleFinish = useCallback(() => {
    setScreen('gameover')
  }, [setScreen])

  const shortcuts = useMemo(
    () => ({
      ' ': isPlaying ? pause : play,
      '5': () => playSegment(5),
      '0': () => playSegment(10),
      ArrowRight: nextSong,
      ArrowLeft: previousSong,
      b: toggleBlur,
    }),
    [isPlaying, pause, play, playSegment, nextSong, previousSong, toggleBlur],
  )
  useKeyboardShortcuts(shortcuts)

  if (!playlist || !currentVideo) return null

  return (
    <div className="flex min-h-dvh flex-col items-center p-4">
      <div ref={containerRef} className="fixed opacity-0 pointer-events-none" />

      {/* Now Playing */}
      <div className="w-full max-w-md space-y-4 mt-4">
        <div className="relative aspect-video overflow-hidden rounded bg-gray-800">
          <img
            src={currentVideo.thumbnail || undefined}
            alt=""
            className={`h-full w-full object-cover transition-all ${
              albumArtBlurred ? 'blur-xl scale-110' : ''
            }`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-4xl opacity-30">♪</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold">{currentVideo.title}</h2>
          <p className="text-gray-400">{currentVideo.artist}</p>
          <p className="text-sm text-gray-500 mt-1">
            Song {currentVideoIndex + 1} / {shuffledIds.length}
          </p>
        </div>

        {/* Transport Controls */}
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            className="rounded bg-gray-700 px-3 py-2 hover:bg-gray-600 disabled:opacity-30"
            onClick={previousSong}
            disabled={atStart}
          >
            ⏮
          </button>
          <button
            className="rounded bg-indigo-600 px-4 py-2 hover:bg-indigo-500"
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            className="rounded bg-indigo-600 px-3 py-2 hover:bg-indigo-500"
            onClick={() => playSegment(5)}
          >
            5s
          </button>
          <button
            className="rounded bg-indigo-600 px-3 py-2 hover:bg-indigo-500"
            onClick={() => playSegment(10)}
          >
            10s
          </button>

          <button
            className="rounded bg-gray-700 px-3 py-2 hover:bg-gray-600 disabled:opacity-30"
            onClick={nextSong}
            disabled={atEnd}
          >
            ⏭
          </button>
        </div>

        {/* Host Actions */}
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            className={`rounded px-3 py-1 text-sm ${
              albumArtBlurred ? 'bg-yellow-700' : 'bg-yellow-600'
            } hover:opacity-80`}
            onClick={toggleBlur}
          >
            {albumArtBlurred ? 'Unblur Art' : 'Blur Art'}
          </button>
          <button
            className="rounded bg-red-700 px-3 py-1 text-sm hover:bg-red-600"
            onClick={skipRound}
          >
            Skip
          </button>
          {atEnd && (
            <button
              className="rounded bg-indigo-600 px-3 py-1 text-sm font-semibold hover:bg-indigo-500"
              onClick={handleFinish}
            >
              Finish Game
            </button>
          )}
        </div>

        {/* Scoreboard */}
        <div className="space-y-2">
          <h3 className="font-semibold">Scoreboard</h3>
          {players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded bg-gray-800 px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: `hsl(${i * 50}, 70%, 60%)` }}
                />
                {p.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono tabular-nums">{p.score}</span>
                <button
                  className="rounded bg-red-800 px-2 py-1 text-xs hover:bg-red-700"
                  onClick={() => removePoint(p.id)}
                >
                  -1
                </button>
                <button
                  className="rounded bg-green-700 px-2 py-1 text-xs hover:bg-green-600"
                  onClick={() => awardPoint(p.id)}
                >
                  +1
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
