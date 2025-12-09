/**
 * add-lyrics.ts
 * 歌詞を対話式で入力し、個別ファイルとして保存するスクリプト
 *
 * 実行: npm run lyrics
 *
 * 保存形式:
 *   scripts/data/lyrics/{song-id}.txt
 *   1行目: # 曲タイトル
 *   2行目: 空行
 *   3行目以降: 歌詞本文
 *
 * 使い方:
 * 1. 曲名を入力（部分一致検索）
 * 2. Uta-NetのHTMLをペースト → Enter
 * 3. 続けて次の曲を入力、または q で終了
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import type { Song } from './types.js';

const LYRICS_DIR = path.join(import.meta.dirname, 'data', 'lyrics');
const SONGS_FILE = path.join(import.meta.dirname, 'output', 'songs.json');

function loadSongs(): Song[] {
  if (!fs.existsSync(SONGS_FILE)) {
    console.error('❌ songs.json が見つかりません。先に npm run 01:songs を実行してください。');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(SONGS_FILE, 'utf-8'));
}

function ensureLyricsDir(): void {
  if (!fs.existsSync(LYRICS_DIR)) {
    fs.mkdirSync(LYRICS_DIR, { recursive: true });
  }
}

function getLyricsPath(songId: string): string {
  return path.join(LYRICS_DIR, `${songId}.txt`);
}

function hasLyrics(songId: string): boolean {
  return fs.existsSync(getLyricsPath(songId));
}

function getRegisteredCount(): number {
  if (!fs.existsSync(LYRICS_DIR)) return 0;
  return fs.readdirSync(LYRICS_DIR).filter(f => f.endsWith('.txt')).length;
}

function saveLyrics(songId: string, title: string, lyrics: string): void {
  ensureLyricsDir();
  const content = [
    `# ${title}`,
    '',
    lyrics,
  ].join('\n');
  fs.writeFileSync(getLyricsPath(songId), content, 'utf-8');
}

function createRL(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function question(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function extractLyricsFromHtml(html: string): string {
  let text = html;

  // kashi_area の中身だけを抽出（あれば）
  const kashiMatch = text.match(/id="kashi_area"[^>]*>(.+?)<\/div>/s);
  if (kashiMatch) {
    text = kashiMatch[1];
  }

  // <br>タグを改行に変換
  text = text.replace(/<br\s*\/?>/gi, '\n');
  // その他のHTMLタグを除去
  text = text.replace(/<[^>]+>/g, '');
  // HTMLエンティティをデコード
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // 前後の空白を除去
  return text.trim();
}

async function readMultilineInput(rl: readline.Interface): Promise<string> {
  console.log('📝 歌詞をペースト → Enterで確定:\n');

  return new Promise((resolve) => {
    const lines: string[] = [];
    let timer: NodeJS.Timeout | null = null;

    const finalize = () => {
      rl.removeListener('line', lineHandler);
      const rawText = lines.join('\n');
      // HTMLっぽい場合は変換処理
      const result = rawText.includes('<br') || rawText.includes('</div>')
        ? extractLyricsFromHtml(rawText)
        : rawText;
      // 末尾の空行を除去
      resolve(result.replace(/\n+$/, ''));
    };

    const lineHandler = (line: string) => {
      lines.push(line);
      // タイマーをリセット（連続入力対応）
      if (timer) clearTimeout(timer);
      timer = setTimeout(finalize, 150);
    };

    rl.on('line', lineHandler);
  });
}

async function main() {
  const songs = loadSongs();
  const rl = createRL();

  // 統計表示
  const totalSongs = songs.length;
  const lyricsCount = getRegisteredCount();
  console.log('\n🎵 Mrs. GREEN APPLE 歌詞入力ツール');
  console.log('═══════════════════════════════════════');
  console.log(`   楽曲数: ${totalSongs}曲`);
  console.log(`   歌詞登録済み: ${lyricsCount}曲 (${Math.round(lyricsCount / totalSongs * 100)}%)`);
  console.log(`   保存先: scripts/data/lyrics/{id}.txt`);
  console.log('═══════════════════════════════════════\n');

  // 未登録の曲一覧
  const missingLyrics = songs.filter(s => !hasLyrics(s.id));
  if (missingLyrics.length === 0) {
    console.log('✅ 全曲の歌詞が登録済みです！');
    rl.close();
    return;
  }

  console.log(`📋 未登録の曲: ${missingLyrics.length}曲\n`);

  while (true) {
    const input = await question(rl, '曲名 (qで終了): ');

    if (input.toLowerCase() === 'q') {
      break;
    }

    if (!input.trim()) {
      continue;
    }

    // 曲名で検索
    const results = songs.filter(s =>
      s.title.toLowerCase().includes(input.toLowerCase())
    );

    if (results.length === 0) {
      console.log('該当する曲が見つかりません。');
      continue;
    }

    // 1件なら即選択、複数なら選択肢表示
    let selectedSong: Song;
    if (results.length === 1) {
      selectedSong = results[0];
    } else {
      console.log('\n検索結果:');
      results.forEach((song, i) => {
        const status = hasLyrics(song.id) ? '✅' : '⬜';
        console.log(`  ${i + 1}. ${status} ${song.title}`);
      });

      const selectInput = await question(rl, '番号 (Enterでキャンセル): ');
      if (!selectInput) continue;

      const selectIndex = parseInt(selectInput, 10) - 1;
      if (selectIndex < 0 || selectIndex >= results.length) {
        console.log('無効な番号です。');
        continue;
      }
      selectedSong = results[selectIndex];
    }

    await addLyricsForSong(rl, selectedSong);

    // 全曲完了チェック
    const stillMissing = songs.filter(s => !hasLyrics(s.id));
    if (stillMissing.length === 0) {
      console.log('\n🎉 全曲の歌詞登録が完了しました！');
      break;
    }
  }

  rl.close();
  console.log('\n👋 終了しました。');

  // 最終統計
  const finalCount = getRegisteredCount();
  console.log(`   歌詞登録済み: ${finalCount}曲 (${Math.round(finalCount / totalSongs * 100)}%)\n`);
}

async function addLyricsForSong(rl: readline.Interface, song: Song): Promise<void> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎵 ${song.title}`);
  console.log(`   リリース: ${song.releaseDate}`);
  console.log(`   ファイル: lyrics/${song.id}.txt`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (hasLyrics(song.id)) {
    const overwrite = await question(rl, '⚠️ 既に歌詞が登録されています。上書きしますか？ (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('スキップしました。');
      return;
    }
  }

  const lyricsText = await readMultilineInput(rl);

  if (!lyricsText.trim()) {
    console.log('歌詞が入力されませんでした。スキップします。');
    return;
  }

  saveLyrics(song.id, song.title, lyricsText);
  console.log(`\n✅ 「${song.title}」の歌詞を保存しました！`);
  console.log(`   → lyrics/${song.id}.txt`);
}

main().catch(console.error);
