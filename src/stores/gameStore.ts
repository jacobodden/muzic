import { create } from 'zustand'
import type { Screen, CachedPlaylist, Player, Round } from '@/types'
import { db } from '@/db/db'

interface GameStore {
  screen: Screen
  playlist: CachedPlaylist | null
  shuffledIds: string[]
  players: Player[]
  currentVideoIndex: number
  rounds: Round[]
  albumArtBlurred: boolean
  titleRevealed: boolean

  setScreen: (screen: Screen) => void
  loadPlaylist: (playlist: CachedPlaylist) => void
  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  setPlayers: (players: Player[]) => void
  nextSong: () => void
  previousSong: () => void
  awardPoint: (playerId: string) => void
  skipRound: () => void
  toggleBlur: () => void
  toggleReveal: () => void
  resetGame: () => void
  getCurrentVideoId: () => string | null
  getStandings: () => Player[]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

let playerCounter = 0

export const useGameStore = create<GameStore>()((set, get) => ({
  screen: 'welcome',
  playlist: null,
  shuffledIds: [],
  players: [],
  currentVideoIndex: 0,
  rounds: [],
  albumArtBlurred: true,
  titleRevealed: false,

  setScreen: (screen) => set({ screen }),

  loadPlaylist: (playlist) => {
    const videoIds = playlist.videos.map((v) => v.videoId)
    set({
      playlist,
      shuffledIds: shuffle(videoIds),
      currentVideoIndex: 0,
      rounds: [],
      albumArtBlurred: true,
      titleRevealed: false,
    })
  },

  addPlayer: (name) => {
    const player: Player = {
      id: `p-${++playerCounter}`,
      name,
      score: 0,
    }
    set((s) => ({ players: [...s.players, player] }))
  },

  removePlayer: (id) => {
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }))
  },

  setPlayers: (players) => set({ players }),

  nextSong: () => {
    set((s) => ({
      currentVideoIndex: Math.min(s.currentVideoIndex + 1, s.shuffledIds.length - 1),
      albumArtBlurred: true,
      titleRevealed: false,
    }))
  },

  previousSong: () => {
    set((s) => ({
      currentVideoIndex: Math.max(s.currentVideoIndex - 1, 0),
      albumArtBlurred: true,
      titleRevealed: false,
    }))
  },

  awardPoint: (playerId) => {
    const state = get()
    const videoId = state.shuffledIds[state.currentVideoIndex]
    if (!videoId) return

    const round: Round = {
      videoId,
      correctPlayerId: playerId,
      pointsAwarded: 1,
      timestamp: Date.now(),
    }

    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, score: p.score + 1 } : p,
      ),
      rounds: [...s.rounds, round],
    }))
  },

  skipRound: () => {
    const state = get()
    const videoId = state.shuffledIds[state.currentVideoIndex]
    if (!videoId) return

    const round: Round = {
      videoId,
      correctPlayerId: null,
      pointsAwarded: 0,
      timestamp: Date.now(),
    }

    set((s) => ({ rounds: [...s.rounds, round] }))
  },

  toggleBlur: () => set((s) => ({ albumArtBlurred: !s.albumArtBlurred })),
  toggleReveal: () => set((s) => ({ titleRevealed: !s.titleRevealed })),

  resetGame: () => {
    const state = get()
    set({
      players: state.players.map((p) => ({ ...p, score: 0 })),
      shuffledIds: state.playlist ? shuffle(state.playlist.videos.map((v) => v.videoId)) : [],
      currentVideoIndex: 0,
      rounds: [],
      albumArtBlurred: true,
      titleRevealed: false,
    })
  },

  getCurrentVideoId: () => {
    const state = get()
    return state.shuffledIds[state.currentVideoIndex] ?? null
  },

  getStandings: () => {
    return [...get().players].sort((a, b) => b.score - a.score)
  },
}))

export async function saveGame(store: GameStore) {
  if (!store.playlist) return
  await db.games.add({
    id: crypto.randomUUID(),
    playlistId: store.playlist.playlistId,
    players: store.players,
    rounds: store.rounds,
    status: store.rounds.length > 0 ? 'finished' : 'setup',
    createdAt: Date.now(),
  })
}
