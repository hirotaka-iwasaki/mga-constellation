# Mrs. GREEN APPLE 動的星座マップ

アルバムやライブを選ぶと星座が浮かび上がる、インタラクティブな楽曲ビジュアライゼーション

## コンセプト

全楽曲がリリース日順のグリッドに配置され、**アルバムやライブを選択すると、該当曲が星座線で結ばれる**。

```
通常: 全ての星が白く輝いている
  ↓
「ANTENNA」を選択
  ↓
収録曲がハイライト + 収録順に星座線（緑）が描画
  ↓
「BABEL no TOH」も追加選択
  ↓
2つの星座が異なる色の線で同時に表示され、比較できる
```

## 特徴

- **動的星座** - アルバム・ライブを選ぶと星座が出現
- **順序を反映** - アルバムは収録順、ライブはセットリスト順で結ぶ
- **複数選択** - 2つ以上の星座を同時表示して比較
- **カードナビゲーション** - GoogleMapsのようにカードをスワイプして星を移動
- **モバイルファースト** - パン・ズーム・ピンチ対応

## プロジェクト構成

```
mga-constellation/
├── MGA-DYNAMIC-CONSTELLATION-SPEC.md  # 設計仕様書
├── README.md
├── CLAUDE.md                          # 開発ガイド
├── TODO.md                            # 残タスク・改善案
├── scripts/
│   ├── package.json
│   ├── tsconfig.json
│   ├── types.ts
│   ├── 01-fetch-songs.ts           # 楽曲データ生成
│   ├── 02-build-constellations.ts  # 星座データ構築
│   ├── 04-calculate-positions.ts   # 位置計算（グリッド配置）
│   ├── 05-export-to-site.ts        # サイトへエクスポート
│   ├── data/
│   │   ├── albums-data.ts          # アルバム収録曲
│   │   └── lives-data.ts           # ライブセットリスト
│   └── output/                     # 生成データ
└── site/                           # フロントエンド（Astro+Preact）
    └── src/
        ├── components/
        │   ├── StarField.tsx        # 星図メインコンポーネント
        │   └── CategorySelector.tsx # カテゴリ選択UI
        └── content/                 # 生成データの出力先
```

## セットアップ

```bash
cd scripts
npm install
```

## ビルド

```bash
# 全ステップを実行
npm run build

# または個別に実行
npm run 01:songs          # 楽曲データ生成
npm run 02:constellations # 星座データ構築
npm run 03:positions      # 位置計算（グリッド配置）
npm run 04:export         # site/へエクスポート
```

## カスタマイズ

### ライブを追加

`scripts/data/lives-data.ts` に追加：

```typescript
{
  id: 'new-live-2025',
  name: '新しいライブ名',
  type: 'arena',
  year: 2025,
  date: '2025-01-01',
  color: '#ff0000',
  songs: ['曲1', '曲2', '曲3'], // セットリスト順
}
```

### アルバムを追加

`scripts/data/albums-data.ts` に追加：

```typescript
{
  id: 'new-album',
  name: '新アルバム',
  type: 'album',
  releaseDate: '2025-01-01',
  color: '#00ff00',
  songs: ['曲1', '曲2', '曲3'], // 収録順
}
```

## 出力データ

### songs.json
```json
{
  "id": "keserasera",
  "title": "ケセラセラ",
  "releaseDate": "2023-04-25",
  "year": 2023
}
```

### constellations.json
```json
{
  "id": "antenna",
  "name": "ANTENNA",
  "type": "album",
  "year": 2023,
  "color": "#4ade80",
  "songs": ["ANTENNA", "Magic", "Blizzard", ...]
}
```

### positions.json
```json
{
  "id": "keserasera",
  "x": 23.5,
  "y": 31.2
}
```

## 技術スタック

- **フレームワーク**: Astro
- **UI**: Preact
- **描画**: SVG + CSS Animations
- **スタイリング**: Tailwind CSS
- **ホスティング**: Cloudflare Pages

## インタラクション

### マップの操作
- **ドラッグ**: パン移動
- **ピンチ/ホイール**: ズーム（最大200%縮小可能）
- **ダブルタップ**: 初期位置にリセット

### カードナビゲーション
- 星をタップすると詳細カードが表示
- カードを左右スワイプで次/前の星に移動
- 星座選択中は、その星座内の曲順でナビゲート
- 星座未選択時は、リリース日順でナビゲート

## ライセンス

ファンによる非公式プロジェクトです。
楽曲の著作権は Mrs. GREEN APPLE および関係者に帰属します。
