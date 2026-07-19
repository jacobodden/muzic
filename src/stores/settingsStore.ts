import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  apiKey: string | null
  lastPlaylistUrl: string | null
  setApiKey: (key: string) => void
  setLastPlaylistUrl: (url: string) => void
  clearApiKey: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKey: null,
      lastPlaylistUrl: null,
      setApiKey: (key) => set({ apiKey: key }),
      setLastPlaylistUrl: (url) => set({ lastPlaylistUrl: url }),
      clearApiKey: () => set({ apiKey: null }),
    }),
    { name: 'hmwybs-settings' },
  ),
)
