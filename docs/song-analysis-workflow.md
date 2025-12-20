# 楽曲分析ワークフロー

Mrs. GREEN APPLEの楽曲を深く理解し、新たなグルーピング（星座）を生成するための分析プロセス。

## 目的

- アーティスト本人の発言から音楽観・世界観を理解する
- 歌詞と発言を照らし合わせて楽曲の本質を推論する
- 従来のアルバム/ライブ単位ではない、テーマ別の新しい星座を作成する

---

## Phase 1: 発言収集

### 収集対象

- **インタビュー記事**（音楽雑誌、Webメディア）
- **ラジオ出演時の発言**
- **MV・楽曲解説コメント**
- **ライブMC**
- **SNS投稿**（公式アカウント）

### 収集時の記録項目

| 項目 | 説明 |
|------|------|
| 発言者 | 大森元貴 / 若井滉斗 / 藤澤涼架 |
| 発言日 | YYYY-MM-DD |
| ソース | 記事URL、雑誌名など |
| 文脈 | どの楽曲/アルバム/ライブについての発言か |
| 発言内容 | 原文またはその要約 |
| キーワード | 抽出したテーマ・概念 |

### 出力ファイル

```
scripts/data/interviews/
├── 2023-rockin-on.json
├── 2024-natalie-columnus.json
└── ...
```

---

## Phase 2: 発言分析

### 分析観点

1. **音楽観**
   - 曲作りへのアプローチ
   - 歌詞で伝えたいこと
   - サウンドへのこだわり

2. **世界観・哲学**
   - 人生観、価値観
   - 繰り返し語られるテーマ
   - メタファーや象徴の使い方

3. **楽曲ごとの意図**
   - 制作背景
   - 込めた想い
   - 聴いてほしいポイント

4. **バンドの方向性**
   - 過去→現在→未来の変遷
   - ターニングポイント
   - 目指している姿

### 出力形式

```typescript
interface ArtistProfile {
  themes: string[];           // 繰り返されるテーマ
  philosophy: string[];       // 核となる価値観
  musicalApproach: string[];  // 音楽制作の特徴
  evolution: {                // 時期ごとの変化
    period: string;
    characteristics: string[];
  }[];
}
```

---

## Phase 3: 楽曲本質推論

### 入力データ

- Phase 2の分析結果（ArtistProfile）
- **楽曲の歌詞テキスト**（必須）
- 楽曲のメタデータ（リリース日、収録アルバム等）

### 歌詞ファイル

```
scripts/data/lyrics/
├── {song-id}.txt      # ID形式（例: s-c1b5ea.txt）
├── {song-name}.txt    # 曲名形式（例: soranji.txt）
└── ...
```

- **曲IDの確認**: `scripts/output/songs.json` で `id` フィールドを参照
- **ファイル形式**: プレーンテキスト（UTF-8）

### 推論プロセス

1. **歌詞のテーマ抽出**（歌詞ファイルを読み込んで実施）
   - キーワード・フレーズの抽出
   - 比喩・象徴の解釈
   - 繰り返されるモチーフの特定

2. **発言との照合**
   - 該当楽曲についての本人コメントがあれば優先
   - なければ類似テーマの発言から推論
   - 歌詞の表現と発言の整合性を確認

3. **楽曲の本質定義**
   - 1-2文での要約
   - 関連テーマのタグ付け
   - 感情・メッセージの分類
   - 歌詞から抽出したキーワードを根拠として記録

### 出力形式

```typescript
interface SongEssence {
  songId: string;
  title: string;
  releaseDate: string;
  themes: string[];           // 主要テーマ（複数可）
  emotion: string;            // 感情トーン
  message: string;            // コアメッセージ（1文）
  interpretation: string;     // 詳細な解釈（2-3文）
  lyricsAnalysis: {           // 歌詞分析結果
    keywords: string[];       // 抽出したキーワード
    motifs: string[];         // 繰り返されるモチーフ
    metaphors?: string[];     // 比喩・象徴表現
  };
  relatedQuotes?: {           // 関連する本人発言
    source: string;
    quote: string;
  }[];
  confidence: 'high' | 'medium' | 'low';  // 推論の確度
}
```

### 出力ファイル

```
scripts/data/analysis/song-essences.json
```

---

## Phase 4: 新グルーピング生成

### グルーピング基準

既存の分類（アルバム/ライブ）とは異なる軸でグループ化：

1. **テーマ別**
   - 「愛」「成長」「葛藤」「希望」など

2. **感情別**
   - 「力強い応援」「切ない恋」「内省的」など

3. **メタファー別**
   - 「光と闇」「季節」「色彩」「自然」など

4. **時期・フェーズ別**
   - バンドの変遷に沿った分類

5. **対比ペア**
   - 表裏一体の楽曲同士

### 出力形式

新しい星座として `scripts/data/theme-constellations.ts` に追加：

```typescript
const THEME_CONSTELLATIONS: Constellation[] = [
  {
    id: 'theme-hikari',
    name: '光を歌う曲',
    type: 'theme',
    year: 2024,  // 作成年
    color: '#FFD700',
    songs: ['青と夏', 'ライラック', ...],
    description: '光や希望をテーマにした楽曲群',
  },
  // ...
];
```

---

## 実装タスク

### データ収集スクリプト

```
scripts/
├── analysis/
│   ├── collect-interviews.ts   # インタビュー収集補助
│   ├── analyze-profile.ts      # 発言分析
│   ├── infer-essence.ts        # 楽曲本質推論
│   └── generate-themes.ts      # テーマ星座生成
```

### AI活用ポイント

- **Phase 1**: 記事のスクレイピング・整形
- **Phase 2**: 発言からのテーマ抽出・パターン認識
- **Phase 3**: 歌詞解釈・本人発言との照合
- **Phase 4**: クラスタリング・グループ提案

---

## 注意事項

- 推論はあくまで「解釈」であり、正解ではない
- 本人発言がある場合はそれを最優先
- 過度な深読み・曲解は避ける
- ファンの一解釈として謙虚に提示する

---

## 参考リンク

- [Mrs. GREEN APPLE 公式サイト](https://mrsgreenapple.com/)
- [ユニバーサルミュージック公式](https://www.universal-music.co.jp/mrsgreenapple/)
