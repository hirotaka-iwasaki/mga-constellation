# Cloudflare Workers + KV/D1 バックエンド導入ガイド

## 概要

現在の静的サイト（Astro + Cloudflare Pages）に、Cloudflare Workers と KV/D1 を組み合わせることで、動的な機能を追加できます。

---

## 導入手順

### Step 1: Wrangler CLI のセットアップ

```bash
# Wrangler（Cloudflare CLI）をインストール
npm install -D wrangler

# Cloudflare にログイン
npx wrangler login
```

### Step 2: Workers プロジェクトの作成

```bash
# プロジェクトルートに functions/ ディレクトリを作成
mkdir functions

# または別ディレクトリで Workers プロジェクトを作成
npx wrangler init api
```

### Step 3: KV Namespace の作成

```bash
# 本番用 KV を作成
npx wrangler kv:namespace create "VOTES"
# => 出力される ID をメモ

# プレビュー用 KV を作成
npx wrangler kv:namespace create "VOTES" --preview
```

### Step 4: wrangler.toml の設定

```toml
name = "mga-constellation-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "VOTES"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"

# D1 を使う場合
[[d1_databases]]
binding = "DB"
database_name = "mga-constellation"
database_id = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"
```

### Step 5: Cloudflare Pages Functions（推奨）

Cloudflare Pages は `functions/` ディレクトリに配置したファイルを自動で Workers として動かせます。

```
site/
├── functions/
│   └── api/
│       ├── vote.ts        # POST /api/vote
│       ├── votes.ts       # GET /api/votes
│       └── feedback.ts    # POST /api/feedback
├── src/
└── ...
```

**例: functions/api/vote.ts**
```typescript
interface Env {
  VOTES: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { ideaId } = await context.request.json();

  // IP ベースのレート制限
  const ip = context.request.headers.get('CF-Connecting-IP');
  const rateKey = `rate:${ip}:${ideaId}`;
  const lastVote = await context.env.VOTES.get(rateKey);

  if (lastVote) {
    const elapsed = Date.now() - parseInt(lastVote);
    if (elapsed < 86400000) { // 24時間制限
      return new Response(JSON.stringify({ error: 'Already voted today' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 投票カウントを増加
  const countKey = `votes:${ideaId}`;
  const current = parseInt(await context.env.VOTES.get(countKey) || '0');
  await context.env.VOTES.put(countKey, String(current + 1));
  await context.env.VOTES.put(rateKey, String(Date.now()));

  return new Response(JSON.stringify({ votes: current + 1 }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Step 6: デプロイ

```bash
# Pages と一緒に自動デプロイされる
git push origin main
```

---

## KV vs D1 の使い分け

| 用途 | KV | D1 |
|------|----|----|
| 単純なカウンター | ◎ | ○ |
| キー検索 | ◎ | ○ |
| 複雑なクエリ | × | ◎ |
| リレーション | × | ◎ |
| 無料枠 | 10万読取/日 | 500万行読取/日 |

**結論**: 投票機能だけなら KV、将来的に複雑なデータが必要なら D1

---

## バックエンドがあるとできること

### 1. 投票・ランキング機能

#### アイデア投票システム
- ロードマップの各アイデアに投票ボタン
- 投票数のリアルタイム表示
- 人気順ソート
- 「実装済み」「検討中」「保留」などのステータス管理

#### 推し曲ランキング
- 各楽曲への「推し」投票
- 週間/月間/全期間ランキング
- 「急上昇」曲のハイライト

#### ベスト星座投票
- 「最も美しい星座」コンテスト
- アルバム/ライブ別の人気投票

---

### 2. ユーザー行動の記録・分析

#### 探索データの匿名集計
- どの曲がよくタップされているか
- どの星座がよく選ばれているか
- 平均セッション時間
- 人気の曲ペア（一緒に見られる曲）

#### ヒートマップ生成
- 星図上でよくタップされるエリアの可視化
- 時間帯別のアクセス傾向

#### 発見率の全体統計
- 「全ユーザーの平均探索率: 67%」
- 「最もレアな曲（発見率が低い）」

---

### 3. ソーシャル機能

#### 共有URL + 閲覧カウント
- 生成した星座URLの閲覧数表示
- 「この星座は○○回見られています」

#### コメント機能
- 各曲へのファンコメント
- 思い出エピソード投稿
- ネタバレ防止の折りたたみ表示

#### いいね機能
- コメントへのリアクション
- 人気コメントのハイライト

---

### 4. パーソナライゼーション

#### お気に入り保存（ログイン不要）
- ブラウザフィンガープリント + KV で擬似ログイン
- お気に入り曲リスト
- 「あとで聴く」リスト

#### 探索履歴
- 過去に見た曲の記録
- 「前回の続きから」機能
- 未探索曲へのジャンプ

#### カスタム星座の保存
- ユーザーが作った星座を保存
- 「みんなの星座」ギャラリー

---

### 5. イベント・キャンペーン機能

#### 期間限定イベント
- 新曲リリース時のカウントダウン
- 記念日の特別演出
- 限定バッジ配布

#### スタンプラリー
- 特定の曲を順番に訪問
- コンプリートで称号付与
- 進捗の保存

#### クイズ・ゲーム
- 星座当てクイズのスコア保存
- ランキング表示
- 正答率の統計

---

### 6. フィードバック・運営機能

#### フィードバック管理
- 送信されたフィードバックをDBに保存
- 管理画面で確認
- ステータス管理（未読/対応中/完了）

#### お知らせ配信
- 新機能リリースのお知らせ
- 最終閲覧日以降のお知らせをバッジ表示

#### A/Bテスト基盤
- 新UIの出し分け
- 効果測定

---

### 7. 外部連携

#### Webhook 通知
- 投票が一定数を超えたらSlack通知
- フィードバック受信時の通知

#### Discord Bot 連携
- ランキング速報
- 新着コメント通知

#### OGP動的生成
- Workers で画像を動的生成
- 選択した星座をプレビュー画像に

---

### 8. セキュリティ・不正対策

#### レート制限
- 同一IPからの連続投票防止
- 秒間リクエスト制限

#### 不正検知
- 異常な投票パターンの検出
- Bot アクセスのブロック

#### CORS 設定
- 許可されたオリジンからのみアクセス

---

## 実装優先度の提案

### Phase 1: 最小限のバックエンド
1. **アイデア投票機能** - KVで十分、すぐ実装可能
2. **フィードバック保存** - 現在のGoogle Forms代替

### Phase 2: エンゲージメント強化
3. **推し曲投票** - 投票システムの拡張
4. **探索統計の匿名集計** - ユーザー行動の把握

### Phase 3: ソーシャル機能
5. **コメント機能** - D1が必要になる可能性
6. **カスタム星座共有** - より複雑なデータ構造

---

## コスト見積もり

### Cloudflare 無料枠（十分な範囲）
- **Workers**: 10万リクエスト/日
- **KV**: 10万読取/日、1000書込/日
- **D1**: 500万行読取/日、10万行書込/日
- **Pages**: 無制限

### 有料プラン（$5/月〜）が必要になる目安
- 1日1万人以上のアクティブユーザー
- 大量の書き込み操作

**結論**: 当面は無料枠で十分運用可能

---

## 次のステップ

1. どの機能から始めるか決める
2. KV or D1 を選択
3. API設計
4. フロントエンド連携実装
5. テスト・デプロイ

---

## 参考リンク

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
