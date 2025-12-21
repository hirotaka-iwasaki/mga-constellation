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
  shortName?: string
  type: 'album' | 'live' | 'theme'
  year: number
  date?: string
  color: string
  songs: string[]
}

export interface SongEssence {
  songId: string
  title: string
  releaseDate: string
  themes: string[]
  emotion: string
  message: string
  interpretation: string
  lyricsAnalysis: {
    keywords: string[]
    motifs: string[]
    metaphors: string[]
  }
  relatedQuotes?: Array<{ source: string; quote: string }>
  connections?: Record<string, string | string[]>
  confidence: string
}
