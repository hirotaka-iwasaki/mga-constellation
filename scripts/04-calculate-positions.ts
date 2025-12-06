/**
 * 04-calculate-positions.ts
 * 楽曲をリリース日順で正方形グリッドに配置
 *
 * 実行: npx tsx 04-calculate-positions.ts
 * 出力: output/positions.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Song, StarPosition } from './types.js';

function main() {
  const outputDir = path.join(import.meta.dirname, 'output');
  const songsPath = path.join(outputDir, 'songs.json');

  if (!fs.existsSync(songsPath)) {
    console.error('❌ output/songs.json が見つかりません');
    process.exit(1);
  }

  const songs: Song[] = JSON.parse(fs.readFileSync(songsPath, 'utf-8'));

  // リリース日でソート（古い順）
  const sortedSongs = [...songs].sort((a, b) =>
    new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  // グリッドサイズを計算（正方形に近くなるように）
  const total = sortedSongs.length;
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);

  console.log(`📐 グリッド: ${cols}列 × ${rows}行 (${total}曲)`);

  // グリッド配置の設定
  const padding = 10; // 端からの余白
  const gridWidth = 100 - padding * 2;
  const gridHeight = 100 - padding * 2;
  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  const positions: StarPosition[] = sortedSongs.map((song, index) => {
    // グリッド位置
    const col = index % cols;
    const row = Math.floor(index / cols);

    // セルの中心に配置
    const x = padding + cellWidth * (col + 0.5);
    const y = padding + cellHeight * (row + 0.5);

    return {
      id: song.id,
      x,
      y,
    };
  });

  // 保存
  fs.writeFileSync(
    path.join(outputDir, 'positions.json'),
    JSON.stringify(positions, null, 2),
    'utf-8'
  );

  console.log(`✅ ${positions.length} 個の星の位置を計算しました`);
  console.log(`   出力: output/positions.json`);
  console.log(`\n📊 配置情報:`);
  console.log(`   セルサイズ: ${cellWidth.toFixed(1)} × ${cellHeight.toFixed(1)}`);
  console.log(`   最初の曲: ${sortedSongs[0].title} (${sortedSongs[0].releaseDate})`);
  console.log(`   最後の曲: ${sortedSongs[total - 1].title} (${sortedSongs[total - 1].releaseDate})`);
}

main();
