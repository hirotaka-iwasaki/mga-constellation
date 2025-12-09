/**
 * 02-build-constellations.ts
 * アルバム・ライブデータから星座データを構築
 * 
 * 実行: npx tsx 02-build-constellations.ts
 * 出力: output/constellations.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Constellation } from './types.js';
import { ALBUMS } from './data/albums-data.js';
import { LIVES } from './data/lives-data.js';

function main() {
  const constellations: Constellation[] = [];

  // アルバムから星座を生成
  for (const album of ALBUMS) {
    constellations.push({
      id: album.id,
      name: album.name,
      type: album.type === 'single' ? 'single' : 'album',
      year: parseInt(album.releaseDate.split('-')[0], 10),
      date: album.releaseDate,
      color: album.color,
      songs: album.songs, // 収録順
    });
  }

  // ライブから星座を生成
  for (const live of LIVES) {
    constellations.push({
      id: live.id,
      name: live.name,
      shortName: live.shortName,
      type: 'live',
      year: live.year,
      date: live.date,
      color: live.color,
      songs: live.songs, // セットリスト順
    });
  }

  // 年代順にソート
  constellations.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (b.date || '').localeCompare(a.date || '');
  });

  // 出力
  const outputDir = path.join(import.meta.dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'constellations.json'),
    JSON.stringify(constellations, null, 2),
    'utf-8'
  );

  console.log(`✅ ${constellations.length} 個の星座データを生成しました`);
  console.log(`   出力: output/constellations.json`);

  // 統計
  const byType = constellations.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 タイプ別:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}個`);
  });

  // 全曲数（重複あり）
  const totalSongs = constellations.reduce((sum, c) => sum + c.songs.length, 0);
  console.log(`\n🎵 星座に含まれる曲数: ${totalSongs}曲（重複含む）`);

  // ユニーク曲
  const uniqueSongs = new Set(constellations.flatMap(c => c.songs));
  console.log(`   ユニーク曲数: ${uniqueSongs.size}曲`);
}

main();
