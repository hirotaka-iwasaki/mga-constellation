/**
 * analyze-songs.ts
 * 歌詞とインタビューデータから楽曲本質を自動分析
 *
 * 使用方法:
 *   ANTHROPIC_API_KEY=sk-xxx npx tsx analyze-songs.ts
 *
 * オプション:
 *   --dry-run    実際にAPIを呼ばずに対象曲を確認
 *   --limit=N    N曲だけ処理（テスト用）
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// 型定義
interface Song {
  id: string;
  title: string;
  releaseDate: string;
  year: number;
}

interface SongEssence {
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
  relatedQuotes?: Array<{
    source: string;
    quote: string;
  }>;
  connections?: {
    album?: string;
    themeRelation?: string[];
    tieUp?: string;
    [key: string]: unknown;
  };
  confidence: 'high' | 'medium' | 'low';
}

interface EssencesFile {
  title: string;
  description: string;
  analyzedAt: string;
  version: string;
  totalSongs: number;
  methodology: string;
  essences: SongEssence[];
  crossAnalysis?: unknown;
  forPhase4?: unknown;
}

interface SongComment {
  hasDirectComment: boolean;
  essence: string;
  themes: string[];
  emotion: string;
  keyInsights: string[];
  productionNote?: string;
  confidence: string;
}

// パス定義
const PATHS = {
  songs: join(import.meta.dirname, 'output/songs.json'),
  essences: join(import.meta.dirname, 'data/analysis/song-essences.json'),
  lyrics: join(import.meta.dirname, 'data/lyrics'),
  comments: join(import.meta.dirname, 'data/interviews/song-comments-index.json'),
  artistProfile: join(import.meta.dirname, 'data/interviews/artist-profile-analyzed.json'),
};

// テーマ候補（既存データから抽出）
const THEME_OPTIONS = [
  "青春・若さ", "成熟", "自己肯定", "孤独との向き合い",
  "希望・再起", "劣等感", "大人になること",
  "死生観・極限", "尊さ", "繋がり",
  "人間愛・肯定", "恋愛・関係性", "葛藤・成長",
  "喪失・別れ", "愛の再認識", "癒し・回復",
  "自己信頼", "過去の受容", "内面の嵐",
  "創作の苦悩", "虚無", "愛の本質",
  "社会観察", "言葉の力", "感情の麻痺",
  "自己解放", "日常の肯定", "寂しさとの共存",
  "始まり・出発", "孤独からの脱却", "乾杯・連帯",
  "笑いの力", "不安の肯定", "受信・感受性",
  "生きている実感", "希望と絶望の共存", "孤独の深淵",
  "生への渇望", "愛への依存", "自己破壊と救済",
  "再出発", "自分らしさ", "感謝"
];

// 感情候補
const EMOTION_OPTIONS = [
  "切ない青春", "力強い応援", "内省・静寂",
  "包容力", "解放・躍動"
];

// データ読み込み
function loadData() {
  const songs: Song[] = JSON.parse(readFileSync(PATHS.songs, 'utf-8'));
  const essencesFile: EssencesFile = JSON.parse(readFileSync(PATHS.essences, 'utf-8'));
  const commentsData = JSON.parse(readFileSync(PATHS.comments, 'utf-8'));

  let artistProfile = null;
  if (existsSync(PATHS.artistProfile)) {
    artistProfile = JSON.parse(readFileSync(PATHS.artistProfile, 'utf-8'));
  }

  return { songs, essencesFile, commentsData, artistProfile };
}

// 歌詞読み込み
function loadLyrics(songId: string, title: string): string | null {
  // IDベースで検索
  const idPath = join(PATHS.lyrics, `${songId}.txt`);
  if (existsSync(idPath)) {
    return readFileSync(idPath, 'utf-8');
  }

  // タイトルベースで検索（英語タイトルの場合）
  const titlePath = join(PATHS.lyrics, `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`);
  if (existsSync(titlePath)) {
    return readFileSync(titlePath, 'utf-8');
  }

  return null;
}

// 本人コメント取得
function getSongComment(title: string, commentsData: any): SongComment | null {
  return commentsData.songsWithComments?.[title] || null;
}

// Claude APIで分析生成
async function analyzeSong(
  client: Anthropic,
  song: Song,
  lyrics: string | null,
  comment: SongComment | null,
  artistProfile: any
): Promise<SongEssence> {
  const systemPrompt = `あなたはMrs. GREEN APPLEの楽曲分析の専門家です。
歌詞とアーティストのコメント・哲学に基づいて、楽曲の本質を分析してください。

## 分析の観点
1. テーマ: 楽曲が扱う主題（複数可）
2. 感情: 楽曲全体のトーン
3. メッセージ: 楽曲が伝えようとしていること（1-2文）
4. 解釈: 歌詞の詳細な解釈（3-5文）
5. 歌詞分析:
   - keywords: 重要な単語・フレーズ
   - motifs: 繰り返されるモチーフ
   - metaphors: 比喩表現とその意味

## 利用可能なテーマ候補
${THEME_OPTIONS.join(', ')}

## 利用可能な感情候補
${EMOTION_OPTIONS.join(', ')}

## 大森元貴の哲学的傾向
- 孤独に寄り添う芸術
- 正解のない世界観
- 有限性の認識
- 人間存在への肯定
- 傷つきながらも愛することを諦めない

## 出力形式
JSON形式で出力してください。必ず有効なJSONとして解析可能な形式で。`;

  const userPrompt = `以下の楽曲を分析してください。

## 楽曲情報
- タイトル: ${song.title}
- リリース日: ${song.releaseDate}
- 楽曲ID: ${song.id}

${lyrics ? `## 歌詞\n${lyrics}` : '## 歌詞\n（歌詞データなし - タイトルと時期から推論してください）'}

${comment ? `## 本人コメント
- 本質: ${comment.essence}
- テーマ（参考）: ${comment.themes.join(', ')}
- 感情（参考）: ${comment.emotion}
- 発言: ${comment.keyInsights.join('\n')}
${comment.productionNote ? `- 制作メモ: ${comment.productionNote}` : ''}` : '## 本人コメント\n（直接コメントなし - 歌詞から推論してください）'}

## 出力
以下のJSON形式で出力してください:
{
  "themes": ["テーマ1", "テーマ2"],
  "emotion": "感情",
  "message": "メッセージ（1-2文）",
  "interpretation": "解釈（3-5文）",
  "lyricsAnalysis": {
    "keywords": ["キーワード1", "キーワード2"],
    "motifs": ["モチーフ1", "モチーフ2"],
    "metaphors": ["比喩1＝意味", "比喩2＝意味"]
  },
  "confidence": "${comment ? 'high' : lyrics ? 'medium' : 'low'}"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: systemPrompt,
  });

  // レスポンスからJSONを抽出
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // JSONブロックを抽出
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse JSON from response: ${content.text}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    songId: song.id,
    title: song.title,
    releaseDate: song.releaseDate,
    themes: parsed.themes,
    emotion: parsed.emotion,
    message: parsed.message,
    interpretation: parsed.interpretation,
    lyricsAnalysis: parsed.lyricsAnalysis,
    confidence: parsed.confidence,
  };
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

  console.log('📊 楽曲本質分析スクリプト\n');

  // データ読み込み
  const { songs, essencesFile, commentsData, artistProfile } = loadData();
  console.log(`📁 全曲数: ${songs.length}`);
  console.log(`✅ 分析済み: ${essencesFile.essences.length}`);

  // 分析済みIDを取得
  const analyzedIds = new Set(essencesFile.essences.map(e => e.songId));

  // 未分析の曲をフィルタリング
  const unanalyzed = songs.filter(s => !analyzedIds.has(s.id));
  console.log(`📝 未分析: ${unanalyzed.length}`);

  // 歌詞の有無を確認
  const withLyrics = unanalyzed.filter(s => loadLyrics(s.id, s.title) !== null);
  const withoutLyrics = unanalyzed.filter(s => loadLyrics(s.id, s.title) === null);
  console.log(`  - 歌詞あり: ${withLyrics.length}`);
  console.log(`  - 歌詞なし: ${withoutLyrics.length}`);

  if (dryRun) {
    console.log('\n📋 未分析曲リスト:');
    unanalyzed.slice(0, 20).forEach(s => {
      const hasLyrics = loadLyrics(s.id, s.title) !== null;
      const hasComment = getSongComment(s.title, commentsData) !== null;
      console.log(`  ${hasLyrics ? '📝' : '❌'} ${hasComment ? '💬' : '  '} ${s.title} (${s.releaseDate})`);
    });
    if (unanalyzed.length > 20) {
      console.log(`  ... 他 ${unanalyzed.length - 20} 曲`);
    }
    return;
  }

  // APIキー確認
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY 環境変数が設定されていません');
    console.error('使用方法: ANTHROPIC_API_KEY=sk-xxx npx tsx analyze-songs.ts');
    process.exit(1);
  }

  const client = new Anthropic();
  const toProcess = unanalyzed.slice(0, limit);
  console.log(`\n🚀 ${toProcess.length} 曲を分析します...\n`);

  const newEssences: SongEssence[] = [];
  let processed = 0;
  let errors = 0;

  for (const song of toProcess) {
    try {
      const lyrics = loadLyrics(song.id, song.title);
      const comment = getSongComment(song.title, commentsData);

      console.log(`[${processed + 1}/${toProcess.length}] ${song.title}...`);

      const essence = await analyzeSong(client, song, lyrics, comment, artistProfile);
      newEssences.push(essence);
      processed++;

      console.log(`  ✅ ${essence.themes.join(', ')}`);

      // レート制限対策: 1秒待機
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`  ❌ エラー: ${error instanceof Error ? error.message : error}`);
      errors++;
    }
  }

  // 結果をマージして保存
  if (newEssences.length > 0) {
    essencesFile.essences.push(...newEssences);
    essencesFile.totalSongs = essencesFile.essences.length;
    essencesFile.analyzedAt = new Date().toISOString().split('T')[0];

    writeFileSync(PATHS.essences, JSON.stringify(essencesFile, null, 2), 'utf-8');
    console.log(`\n✅ ${newEssences.length} 曲を追加しました`);
    console.log(`📁 合計: ${essencesFile.essences.length} 曲`);
  }

  if (errors > 0) {
    console.log(`⚠️ ${errors} 件のエラーがありました`);
  }
}

main().catch(console.error);
