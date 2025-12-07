/**
 * types.ts
 * サイト共通の型定義
 */

export interface Song {
  id: string
  title: string
  releaseDate: string
  year: number
}

export interface StarPosition {
  id: string
  x: number
  y: number
}

export interface Constellation {
  id: string
  name: string
  type: 'album' | 'live' | 'theme'
  year: number
  date?: string
  color: string
  songs: string[]
}
