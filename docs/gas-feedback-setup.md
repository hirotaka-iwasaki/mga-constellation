# Google Apps Script フィードバックフォーム セットアップ手順

## 1. Google スプレッドシートを作成

1. [Google スプレッドシート](https://docs.google.com/spreadsheets/) にアクセス
2. 「空白」で新しいスプレッドシートを作成
3. スプレッドシート名を「MGA Constellation フィードバック」などに変更
4. 1行目にヘッダーを入力:
   - A1: `タイムスタンプ`
   - B1: `カテゴリ`
   - C1: `内容`

## 2. Apps Script を作成

1. スプレッドシートのメニューから「拡張機能」→「Apps Script」を選択
2. エディタが開いたら、以下のコードを貼り付け:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // データを追加
    sheet.appendRow([
      new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      data.category || '未分類',
      data.content || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS対応（プリフライトリクエスト用）
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. プロジェクト名を「MGA Feedback」などに変更して保存（Ctrl+S / Cmd+S）

## 3. Web アプリとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 左側の歯車アイコンをクリック →「ウェブアプリ」を選択
3. 以下の設定を行う:
   - 説明: `フィードバック受付 v1`
   - 次のユーザーとして実行: `自分`
   - アクセスできるユーザー: `全員`
4. 「デプロイ」をクリック
5. 初回は「アクセスを承認」をクリックし、Googleアカウントで認証
6. **表示されたウェブアプリのURLをコピー**（これが API エンドポイント）

## 4. 環境変数を設定

コピーしたURLを `site/.env` ファイルに追加:

```
PUBLIC_FEEDBACK_URL=https://script.google.com/macros/s/XXXXX.../exec
```

※ `PUBLIC_` プレフィックスにより、クライアントサイドで使用可能になります

## 5. 動作確認

ブラウザのコンソールから以下を実行してテスト:

```javascript
fetch('YOUR_GAS_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'テスト',
    content: 'テスト投稿です'
  })
}).then(r => r.json()).then(console.log)
```

スプレッドシートに行が追加されれば成功です。

## 6. Cloudflare Pages での環境変数設定

本番環境（Cloudflare Pages）では、ダッシュボードから環境変数を設定します:

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にアクセス
2. 対象のプロジェクト（mga-constellation）を選択
3. 「Settings」→「Environment variables」を開く
4. 「Add variable」をクリック
5. 以下を入力:
   - Variable name: `PUBLIC_FEEDBACK_URL`
   - Value: GASのWebアプリURL
6. 「Save」をクリック
7. 再デプロイして反映

---

## トラブルシューティング

### CORS エラーが出る場合
- GAS の Web アプリは自動的に CORS ヘッダーを付与するため、通常は問題ありません
- `mode: 'no-cors'` は使用しないでください（レスポンスが読めなくなります）

### 403 エラーが出る場合
- 「アクセスできるユーザー」が「全員」になっているか確認
- 再デプロイが必要な場合があります

### スプレッドシートに書き込まれない場合
- Apps Script のログ（実行数→ログを表示）を確認
- スプレッドシートの権限を確認
