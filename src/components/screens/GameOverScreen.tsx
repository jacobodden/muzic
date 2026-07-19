import { useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { saveGame } from '@/stores/gameStore'

export default function GameOverScreen() {
  const players = useGameStore((s) => s.players)
  const rounds = useGameStore((s) => s.rounds)
  const resetGame = useGameStore((s) => s.resetGame)
  const setScreen = useGameStore((s) => s.setScreen)

  const standings = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players],
  )

  function handlePlayAgain() {
    resetGame()
    setScreen('game')
  }

  function handleNewPlaylist() {
    setScreen('welcome')
  }

  function handleEditPlayers() {
    setScreen('setup')
  }

  // Persist game on mount (runs once)
  useMemo(() => {
    const state = useGameStore.getState()
    if (state.playlist) {
      saveGame(state).catch(console.error)
    }
  }, [])

  return (
    <div className="flex min-h-dvh flex-col items-center p-4">
      <h1 className="text-3xl font-bold my-4">Game Over</h1>

      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl space-y-6">
        <div className="space-y-2">
          {standings.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded px-4 py-3 ${
                i === 0 ? 'bg-slate-700 ring-1 ring-slate-500' : 'bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                {i === 0 && <span className="text-lg">1st</span>}
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: `hsl(${players.indexOf(p) * 50}, 70%, 60%)`,
                  }}
                />
                {p.name}
              </span>
              <span className="font-mono tabular-nums text-lg">{p.score}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400">
          {rounds.length} rounds played
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="rounded bg-slate-700 px-4 py-2 font-semibold hover:bg-slate-600"
            onClick={handlePlayAgain}
          >
            Play Again
          </button>
          <button
            className="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
            onClick={handleEditPlayers}
          >
            Edit Players
          </button>
          <button
            className="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
            onClick={handleNewPlaylist}
          >
            New Playlist
          </button>
        </div>
      </div>
    </div>
  )
}
