export type Screen = 'welcome' | 'setup' | 'game' | 'gameover'

export interface CachedVideo {
  videoId: string
  title: string
  artist: string
  thumbnail: string
}

export interface CachedPlaylist {
  playlistId: string
  url: string
  name: string
  videos: CachedVideo[]
  cachedAt: number
}

export interface Player {
  id: string
  name: string
  score: number
}

export interface Round {
  videoId: string
  correctPlayerId: string | null
  pointsAwarded: number
  timestamp: number
}

export type GameStatus = 'setup' | 'playing' | 'finished'

export interface GameSession {
  id: string
  playlistId: string
  players: Player[]
  rounds: Round[]
  status: GameStatus
  createdAt: number
  finishedAt?: number
}
