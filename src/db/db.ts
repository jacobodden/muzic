import Dexie, { type Table } from 'dexie'
import type { CachedPlaylist, GameSession } from '@/types'

export class AppDB extends Dexie {
  playlists!: Table<CachedPlaylist, string>
  games!: Table<GameSession, string>

  constructor() {
    super('HitMeWithYourBestShot')
    this.version(1).stores({
      playlists: '&playlistId, name, cachedAt',
      games: '&id, createdAt',
    })
  }
}

export const db = new AppDB()
