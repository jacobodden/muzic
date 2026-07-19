import { create } from 'zustand'

interface PlayerStore {
  isReady: boolean
  isPlaying: boolean
  currentTime: number

  setReady: (ready: boolean) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  isReady: false,
  isPlaying: false,
  currentTime: 0,

  setReady: (ready) => set({ isReady: ready }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
}))
