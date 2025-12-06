/**
 * 01-fetch-songs.ts
 * 楽曲基本情報を生成
 * 
 * 実行: npx tsx 01-fetch-songs.ts
 * 出力: output/songs.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Song } from './types.js';

// 楽曲データ（2014-2025）
const RAW_SONGS = `
GOOD DAY|2025-09-28
Variety|2025-12-31
夏の影|2025-08-11
Carrying Happiness|2025-07-19
慶びの種|2025-07-08
breakfast|2025-06-04
天国|2025-05-02
クスシキ|2025-04-05
ダーリン|2025-01-20
ビターバカンス|2024-11-29
The White Lounge|2024-09-23
familie|2024-08-09
アポロドロス|2024-07-03
コロンブス|2024-06-12
Dear|2024-05-20
ライラック|2024-04-12
ナハトムジーク|2024-01-17
Feeling|2023-07-05
BFF|2023-07-05
Doodle|2023-07-05
橙|2023-07-05
norn|2023-07-05
Loneliness|2023-07-05
アンラブレス|2023-07-05
Blizzard|2023-07-05
Magic|2023-07-05
ANTENNA|2023-07-05
ケセラセラ|2023-04-25
フロリジナル|2022-11-09
私は最強|2022-11-09
Soranji|2022-11-09
Part of me|2022-07-08
延々|2022-07-08
君を知らない|2022-07-08
ブルーアンビエンス|2022-07-08
ダンスホール|2022-07-08
ニュー・マイ・ノーマル|2022-03-18
Theater|2020-07-08
アボイドノート|2020-07-08
PRESENT|2020-04-10
Circle|2019-10-02
Soup|2019-10-02
嘘じゃないよ|2019-10-02
Ke-Mo Sah-Bee|2019-10-02
lovin'|2019-10-02
クダリ|2019-10-02
ProPose|2019-10-02
Viking|2019-10-02
CHEERS|2019-10-02
Attitude|2019-10-02
InsPirATioN|2019-10-02
インフェルノ|2019-07-18
月とアネモネ|2019-04-03
How-to|2019-04-03
ロマンチシズム|2019-04-03
Folktale|2019-01-09
灯火|2019-01-09
僕のこと|2019-01-09
ア・プリオリ|2018-08-01
点描の唄|2018-08-01
青と夏|2018-08-01
Coffee|2018-04-18
REVERSE|2018-04-18
SPLASH!!!|2018-04-18
They are|2018-04-18
はじまり|2018-04-18
アウフヘーベン|2018-04-18
PARTY|2018-04-18
春愁|2018-02-14
Log|2018-02-14
Love me, Love you|2018-02-14
WHOO WHOO WHOO|2017-12-04
光のうた|2017-08-30
On My MiND|2017-08-30
WanteD! WanteD!|2017-08-30
SwitCh|2017-05-03
スマイロブドリーマ|2017-05-03
どこかで日は昇る|2017-05-03
JOURNEY|2017-01-11
Just a Friend|2017-01-11
うブ|2017-01-11
鯨の唄|2017-01-11
soFt-dRink|2017-01-11
絶世生物|2017-01-11
おもちゃの兵隊|2017-01-11
Lion|2017-01-11
Oz|2016-11-02
ツキマシテハ|2016-11-02
In the Morning|2016-11-02
ノニサクウタ|2016-06-15
umbrella|2016-06-15
サママ・フェスティバル！|2016-06-15
庶幾の唄|2016-01-13
Hug|2016-01-13
InTerLuDe|2016-01-13
SimPle|2016-01-13
ミスカサズ|2016-01-13
No.7|2016-01-13
私|2016-01-13
キコリ時計|2016-01-13
パブリック|2016-01-13
愛情と矛先|2016-01-13
えほん|2015-12-16
恋と吟|2015-12-16
Speaking|2015-12-16
道徳と皿|2015-07-08
ゼンマイ|2015-07-08
VIP|2015-07-08
L.P|2015-07-08
StaRt|2015-07-08
WaLL FloWeR|2015-02-18
日々と君|2015-02-18
アンゼンパイ|2015-02-18
CONFLICT|2015-02-18
ナニヲナニヲ|2015-02-18
我逢人|2015-02-18
リスキーゲーム|2014-07-05
FACTORY|2014-07-05
スターダム|2014-07-05
藍|2014-07-05
HeLLo|2014-07-05
`.trim();

function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[（）()「」『』\s]/g, '-')
    .replace(/[!！?？、。・']/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `song-${Date.now()}`;
}

function main() {
  const lines = RAW_SONGS.split('\n').filter(l => l.trim());
  
  const songs: Song[] = lines.map(line => {
    const [title, dateStr] = line.split('|');
    const year = parseInt(dateStr.split('-')[0], 10);

    return {
      id: generateId(title),
      title,
      releaseDate: dateStr,
      year,
    };
  });

  // 出力ディレクトリ作成
  const outputDir = path.join(import.meta.dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'songs.json'),
    JSON.stringify(songs, null, 2),
    'utf-8'
  );

  console.log(`✅ ${songs.length} 曲の楽曲データを生成しました`);
  console.log(`   出力: output/songs.json`);

  // 年代別統計
  const byYear = songs.reduce((acc, s) => {
    acc[s.year] = (acc[s.year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  console.log('\n📊 年代別:');
  Object.entries(byYear)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([year, count]) => {
      console.log(`   ${year}: ${count}曲`);
    });
}

main();
