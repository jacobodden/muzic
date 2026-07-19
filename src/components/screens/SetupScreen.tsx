import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

export default function SetupScreen() {
  const playlist = useGameStore((s) => s.playlist)
  const players = useGameStore((s) => s.players)
  const addPlayer = useGameStore((s) => s.addPlayer)
  const removePlayer = useGameStore((s) => s.removePlayer)
  const setScreen = useGameStore((s) => s.setScreen)

  const [nameInput, setNameInput] = useState('')

  if (!playlist) return null

  function handleAdd() {
    const name = nameInput.trim()
    if (!name) return
    addPlayer(name)
    setNameInput('')
  }

  return (
    <div className="flex min-h-dvh flex-col items-center p-4">
      <h1 className="text-2xl font-bold my-4">Setup Game</h1>

      <div className="w-full max-w-md space-y-6">
        <div className="rounded bg-gray-800 p-4">
          <p className="font-semibold">{playlist.name}</p>
          <p className="text-sm text-gray-400">{playlist.videos.length} songs</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Players</h2>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 rounded bg-gray-800 border border-gray-600 px-3 py-2"
              placeholder="Player name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              className="rounded bg-indigo-600 px-4 py-2 hover:bg-indigo-500 disabled:opacity-50"
              onClick={handleAdd}
              disabled={!nameInput.trim()}
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
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
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => removePlayer(p.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {players.length === 0 && (
            <p className="text-sm text-gray-500">Add at least 2 players to start.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            onClick={() => setScreen('welcome')}
          >
            Back
          </button>
          <button
            className="flex-1 rounded bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            disabled={players.length < 2}
            onClick={() => setScreen('game')}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}
