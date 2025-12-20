/**
 * 05-export-to-site.ts
 * 全データをサイト用にエクスポート
 *
 * 実行: npx tsx 05-export-to-site.ts
 * 出力: ../site/src/content/
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Song, Constellation, StarPosition, ExportData } from './types.js';

interface SongEssenceRaw {
  songId: string;
  title: string;
  releaseDate: string;
  themes: string[];
  emotion: string;
  message: string;
  interpretation: string;
  lyricsAnalysis: {
    keywords: string[];
    motifs: string[];
    metaphors: string[];
  };
  relatedQuotes: Array<{ source: string; quote: string }>;
  connections: Record<string, string | string[]>;
  confidence: string;
}

function main() {
  const outputDir = path.join(import.meta.dirname, 'output');
  const dataDir = path.join(import.meta.dirname, 'data', 'analysis');
  const siteContentDir = path.join(import.meta.dirname, '..', 'site', 'src', 'content');

  // 必要なファイル確認
  const requiredFiles = ['songs.json', 'constellations.json', 'positions.json'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(outputDir, file))) {
      console.error(`❌ output/${file} が見つかりません`);
      process.exit(1);
    }
  }

  // データ読み込み
  const songs: Song[] = JSON.parse(fs.readFileSync(path.join(outputDir, 'songs.json'), 'utf-8'));
  const constellations: Constellation[] = JSON.parse(fs.readFileSync(path.join(outputDir, 'constellations.json'), 'utf-8'));
  const positions: StarPosition[] = JSON.parse(fs.readFileSync(path.join(outputDir, 'positions.json'), 'utf-8'));

  // エッセンスデータ読み込み（存在する場合）
  let essencesMap: Record<string, SongEssenceRaw> = {};
  const essencesPath = path.join(dataDir, 'song-essences.json');
  if (fs.existsSync(essencesPath)) {
    const essencesData = JSON.parse(fs.readFileSync(essencesPath, 'utf-8'));
    // songId をキーにしたマップに変換（高速検索のため）
    for (const e of essencesData.essences) {
      essencesMap[e.songId] = e;
    }
    console.log(`📖 エッセンスデータ読み込み: ${Object.keys(essencesMap).length}曲`);
  }

  // サイトディレクトリ作成
  if (!fs.existsSync(siteContentDir)) {
    fs.mkdirSync(siteContentDir, { recursive: true });
  }

  // 個別ファイルとして出力
  fs.writeFileSync(path.join(siteContentDir, 'songs.json'), JSON.stringify(songs, null, 2));
  fs.writeFileSync(path.join(siteContentDir, 'constellations.json'), JSON.stringify(constellations, null, 2));
  fs.writeFileSync(path.join(siteContentDir, 'positions.json'), JSON.stringify(positions, null, 2));

  // エッセンスデータ出力（songId をキーにしたオブジェクト形式）
  if (Object.keys(essencesMap).length > 0) {
    fs.writeFileSync(path.join(siteContentDir, 'essences.json'), JSON.stringify(essencesMap, null, 2));
  }

  // 統合データも出力（オプション）
  const exportData: ExportData = {
    songs,
    constellations,
    positions,
    meta: {
      generatedAt: new Date().toISOString(),
      version: '3.0.0',
      totalSongs: songs.length,
      totalConstellations: constellations.length,
    },
  };
  fs.writeFileSync(path.join(siteContentDir, 'all-data.json'), JSON.stringify(exportData, null, 2));

  console.log(`✅ サイトへエクスポート完了`);
  console.log(`   出力先: ${siteContentDir}`);
  console.log('');
  console.log(`📦 エクスポートしたファイル:`);
  console.log(`   - songs.json (${songs.length}曲)`);
  console.log(`   - constellations.json (${constellations.length}個)`);
  console.log(`   - positions.json (${positions.length}個)`);
  console.log(`   - all-data.json (統合)`);
  if (Object.keys(essencesMap).length > 0) {
    console.log(`   - essences.json (${Object.keys(essencesMap).length}曲分の分析データ)`);
  }

  // 星座タイプ別統計
  console.log('\n📊 星座の内訳:');
  const albumConst = constellations.filter(c => c.type === 'album' || c.type === 'single');
  const liveConst = constellations.filter(c => c.type === 'live');
  console.log(`   アルバム/シングル: ${albumConst.length}個`);
  console.log(`   ライブ: ${liveConst.length}個`);
}

main();
