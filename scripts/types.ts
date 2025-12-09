/**
 * types.ts
 * v3 共通型定義
 */

// 楽曲
export interface Song {
  id: string;
  title: string;
  releaseDate: string;
  year: number;
}

// 星座（アルバム/ライブ/テーマ）
export interface Constellation {
  id: string;
  name: string;
  shortName?: string; // カード表示用の短い名前
  type: 'album' | 'live' | 'theme';
  year: number;
  date?: string;
  color: string;
  songs: string[]; // 曲タイトルの配列（順序あり）
}

// 星の位置
export interface StarPosition {
  id: string;
  x: number;
  y: number;
}

// エクスポート用データ
export interface ExportData {
  songs: Song[];
  constellations: Constellation[];
  positions: StarPosition[];
  meta: {
    generatedAt: string;
    version: string;
    totalSongs: number;
    totalConstellations: number;
  };
}
