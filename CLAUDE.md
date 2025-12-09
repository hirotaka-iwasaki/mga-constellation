# CLAUDE.md - Mrs. GREEN APPLE 動的星座マップ

## プロジェクト概要

Mrs. GREEN APPLEの全楽曲をリリース日順のグリッドに配置し、アルバムやライブを選択すると該当曲が星座線で結ばれるインタラクティブなファンメイド・ビジュアライゼーション。

**コンセプト**: カテゴリ（アルバム/ライブ/シングル）を選ぶと星座が浮かび上がる

## ディレクトリ構成

```
mga-constellation/
├── scripts/                      # データ生成パイプライン
│   ├── 01-fetch-songs.ts         # 楽曲カタログ生成（121曲）
│   ├── 02-build-constellations.ts # 星座データ構築
│   ├── 04-calculate-positions.ts # 星の座標計算（グリッド配置）
│   ├── 05-export-to-site.ts      # site/へエクスポート
│   ├── data/                     # 入力データ（TypeScript）
│   │   ├── albums-data.ts        # アルバム・シングル定義
│   │   └── lives-data.ts         # ライブ・セットリスト定義
│   ├── output/                   # 生成されたJSONデータ
│   └── types.ts                  # 共通型定義
├── site/                         # フロントエンド（Astro+Preact）
│   └── src/
│       ├── components/           # Preactコンポーネント
│       │   ├── StarField.tsx     # 星図メイン
│       │   └── CategorySelector.tsx # カテゴリ選択UI
│       └── content/              # 生成データの出力先
├── MGA-DYNAMIC-CONSTELLATION-SPEC.md  # 詳細設計仕様書
└── README.md
└── TODO.md                       # 残タスク・改善案
```

## クイックコマンド

```bash
cd scripts

# 依存関係インストール
npm install

# 全ビルドステップを順次実行
npm run build

# 個別実行
npm run 01:songs          # 楽曲データ生成
npm run 02:constellations # 星座データ構築
npm run 03:positions      # 位置計算（グリッド配置）
npm run 04:export         # site/へエクスポート
```

```bash
cd site

# 開発サーバー起動
npm run dev
```

## 技術スタック

- **データ処理**: TypeScript + Node.js (tsx)
- **フロントエンド**: Astro + Preact + Tailwind CSS
- **描画**: SVG + CSS Animations
- **ホスティング**: Cloudflare Pages

## 開発方針

### モバイルファースト
- **主要ターゲット: スマートフォン**
- タッチ操作を前提としたUI設計
- ビューポートは縦長を基本とする

### パフォーマンス優先
- **表示速度とUXを最重視**
- 機能追加時は必ずパフォーマンスへの影響を考慮
- 不要な再レンダリング・重い処理を避ける
- Core Web Vitals（LCP, CLS, INP）を意識した実装

### インタラクション設計
- 星のタップ → 詳細カード表示
- カードスワイプ/矢印 → 次/前の曲へ移動（画面も追従）
- ドラッグ → パン移動
- ピンチ → ズーム
- ダブルタップ → 初期位置にリセット

### 表示設計
- 星は全て白で統一（サイズも統一）
- 星座線は各星座の固有色で表示
- 複数星座の同時選択が可能
- 星座選択時はその星座の曲順でカードナビゲーション

## 主要な型定義 (scripts/types.ts)

```typescript
// 楽曲
interface Song {
  id: string;           // URL-friendly ID
  title: string;
  releaseDate: string;  // YYYY-MM-DD
  year: number;
}

// 星座（アルバム/ライブ/シングル）
interface Constellation {
  id: string;
  name: string;
  type: 'album' | 'live' | 'single' | 'theme';
  year: number;
  date?: string;
  color: string;        // Hex
  songs: string[];      // タイトル配列（順序が重要）
}

// 星の位置
interface StarPosition {
  id: string;
  x: number;            // 0-100
  y: number;            // 0-100
}
```

## 位置計算アルゴリズム

`04-calculate-positions.ts` は楽曲をリリース日順でソートし、正方形グリッド（11×11）に配置。左上が最も古い曲、右下が最も新しい曲。

## データ追加・変更の手順

### 新曲を追加
1. `scripts/01-fetch-songs.ts` の `RAW_SONGS` に曲名とリリース日を追加
2. `npm run build` で再生成

### ライブを追加
`scripts/data/lives-data.ts`:
```typescript
{
  id: 'new-tour-2025',
  name: '新ツアー名',
  type: 'dome',  // dome | arena | hall | fc
  year: 2025,
  date: '2025-MM-DD',
  color: '#xxxxxx',
  songs: ['曲1', '曲2', ...],  // セットリスト順
}
```

### アルバム/シングルを追加
`scripts/data/albums-data.ts`:
```typescript
{
  id: 'new-album',
  name: 'アルバム名',
  type: 'album',  // album | mini | best | single
  releaseDate: '2025-MM-DD',
  color: '#xxxxxx',
  songs: ['曲1', '曲2', ...],  // 収録順
}
```

## 公式ファン活動ガイドライン

> 出典: https://www.universal-music.co.jp/mrsgreenapple/guide/

### 許可されている用途

**動画コンテンツ:**
- 「弾いてみた」「歌ってみた」「踊ってみた」動画
- 複数楽曲のメドレー形式での使用
- その他ファンオリジナルコンテンツへの組み込み

**写真・映像の使用:**
- 公式サイト、ユニバーサルミュージック公式ページ、オフィシャルYouTubeチャンネルから取得した「ジャケット写真、アーティスト写真、ライブ写真」をファン制作動画に表示可能

### 重要な制限事項

- **マネタイズ禁止** — すべてのコンテンツは個人使用に限定、収益化不可
- **アーティストのイメージ保護** — 「アーティストの意向やイメージを傷つける編集」は避けるべき
- **他者の権利尊重** — ライブ映像では他の出演者や観客が写らないよう注意が必要

### 禁止行為

- 誹謗中傷、名誉毀損
- 第三者の知的財産権や肖像権の無許諾使用
- ユニバーサルミュージックは予告なく削除可能

### 本プロジェクトでの遵守事項

- **非営利**: 広告なし、収益化なし
- **公式素材の適切な使用**: ジャケット写真は公式サイトから取得し、出典を明記
- **リスペクト**: アーティストのイメージを損なう表現は行わない
- **著作権表記**: 楽曲の著作権はMrs. GREEN APPLEおよび関係者に帰属することを明記

## 注意事項

- 楽曲の著作権は Mrs. GREEN APPLE および関係者に帰属
- ファンによる非公式プロジェクト
- 公式ガイドラインに準拠したファン活動として運営
