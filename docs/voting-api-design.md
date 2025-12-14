# 投票API設計書

## 概要

RoadmapModal のアイデアリストに投票機能を追加するためのバックエンドAPI設計。

## 技術スタック

| 項目 | 技術 | 理由 |
|------|------|------|
| ランタイム | Cloudflare Pages Functions | 既存ホスティングと統合 |
| データストア | Cloudflare KV | シンプル、高速、無料枠十分 |
| レート制限 | なし | 無制限投票（localStorage でUX管理） |

---

## API仕様

### GET /api/votes

全アイデアの投票数を取得。

**Response**
```json
{
  "votes": {
    "explore-lucky-star": 12,
    "explore-song-analysis": 8,
    "share-url-short": 5
  }
}
```

**エラーレスポンス**
```json
{
  "error": "internal_error"
}
```

---

### POST /api/vote

指定アイデアに投票。

**Request**
```json
{
  "ideaId": "explore-lucky-star"
}
```

**Response（成功）**
```json
{
  "success": true,
  "votes": 13
}
```

**Response（エラー: 無効なideaId）**
```json
{
  "success": false,
  "error": "invalid_idea"
}
```

---

## KV設計

### Namespace

- **Name**: `VOTES`
- **Binding**: `VOTES`

### キー構造

| キーパターン | 値 | TTL | 説明 |
|-------------|-----|-----|------|
| `votes:{ideaId}` | 数値文字列 | なし | 投票カウント |

**例**:
- `votes:explore-lucky-star` → `"42"`
- `votes:share-url-short` → `"18"`

---

## 有効なアイデアID一覧

カテゴリプレフィックス + ケバブケース:

### explore（探索・発見）
- `explore-song-analysis`
- `explore-concept-constellation`
- `explore-lucky-star`
- `explore-first-live-link`
- `explore-progress-counter`
- `explore-easter-egg`
- `explore-common-songs`
- `explore-guide-mode`
- `explore-complete-constellation`
- `explore-quiz`
- `explore-audio-preview`
- `explore-ar-mode`

### share（共有・カスタマイズ）
- `share-url-short`
- `share-hashtag`
- `share-diagnosis`
- `share-complete-badge`
- `share-dynamic-ogp`

### display（表示・演出）
- `display-jacket`
- `display-song-label`
- `display-phase`
- `display-pulse-animation`
- `display-shooting-star`
- `display-bg-color`
- `display-color-theme`

### utility（便利機能）
- `utility-pwa`
- `utility-spotify`
- `utility-apple-music`
- `utility-i18n`

---

## セキュリティ

### CORS
- 同一オリジンのみ許可
- `Access-Control-Allow-Origin`: 本番ドメインのみ

### 入力検証
- `ideaId` は上記ホワイトリストでバリデーション
- 不正な `ideaId` は `400 Bad Request`

---

## クライアント側実装

### localStorage

**キー**: `mga-voted-ideas`
**値**: 投票済み ideaId の配列（JSON）

```javascript
// 保存
const voted = JSON.parse(localStorage.getItem('mga-voted-ideas') || '[]')
voted.push('explore-lucky-star')
localStorage.setItem('mga-voted-ideas', JSON.stringify(voted))

// 確認
const isVoted = voted.includes('explore-lucky-star')
```

### UI状態

| 状態 | ボタン表示 |
|------|-----------|
| 未投票 | 白アウトライン、クリック可能 |
| 投票済み | 緑背景 + ✓マーク |

---

## セットアップ手順

### 1. Wrangler CLIインストール

```bash
cd site
npm install -D wrangler
```

### 2. Cloudflareログイン

```bash
npx wrangler login
```

### 3. KV Namespace作成

```bash
# 本番用
npx wrangler kv:namespace create "VOTES"
# => ID をメモ

# プレビュー用
npx wrangler kv:namespace create "VOTES" --preview
# => preview_id をメモ
```

### 4. wrangler.toml 設定

`site/wrangler.toml`:
```toml
name = "mga-constellation"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "VOTES"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
```

### 5. ローカル開発

```bash
# Pages Functions をローカルで実行
npx wrangler pages dev dist --kv=VOTES
```

### 6. デプロイ

Cloudflare Pages は `functions/` ディレクトリを自動検出してデプロイ。

```bash
git push origin feature/voting-api
```

Cloudflare Dashboard で KV binding を設定:
1. Pages プロジェクト → Settings → Functions
2. KV namespace bindings → Add binding
3. Variable name: `VOTES`, KV namespace: 作成したnamespace

---

## ファイル構成

```
site/
├── functions/
│   └── api/
│       ├── votes.ts     # GET /api/votes
│       └── vote.ts      # POST /api/vote
├── src/
│   └── components/
│       └── RoadmapModal.tsx
└── wrangler.toml
```

---

## 無料枠の制限

| リソース | 無料枠 | 想定使用量 |
|----------|--------|-----------|
| KV 読み取り | 10万/日 | 〜1万（十分） |
| KV 書き込み | 1000/日 | 〜500（十分） |
| Workers リクエスト | 10万/日 | 〜1万（十分） |

---

## 将来の拡張案

1. **人気順ソート**: 投票数でアイデアを並び替え
2. **トレンド表示**: 直近24時間の投票増加率
3. **実装済みステータス**: 実装されたアイデアにバッジ表示
