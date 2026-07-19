import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  lastPlaylistUrl: string | null
  setLastPlaylistUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      lastPlaylistUrl: null,
      setLastPlaylistUrl: (url) => set({ lastPlaylistUrl: url }),
    }),
    { name: 'hmwybs-settings' },
  ),
)
