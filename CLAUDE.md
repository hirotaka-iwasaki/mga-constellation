# CLAUDE.md - Mrs. GREEN APPLE 動的星座マップ

## 概要

Mrs. GREEN APPLEの全楽曲をリリース日順グリッドに配置し、アルバム/ライブ選択で星座線が結ばれるファンメイド・ビジュアライゼーション。

## ディレクトリ構成

```
mga-constellation/
├── scripts/           # データ生成（01〜05の順で実行）
│   ├── data/          # albums-data.ts, lives-data.ts
│   └── output/        # 生成JSON
├── site/              # Astro+Preact フロントエンド
│   ├── functions/api/ # Cloudflare Pages Functions（投票API）
│   └── src/components/# StarField.tsx 等
└── docs/              # 設計書
```

## コマンド

```bash
make dev        # 依存インストール + 開発サーバー起動（API含む）
make dev-front  # フロントエンドのみ起動（APIなし、高速）
make build      # 本番ビルド
make data       # 楽曲・星座データ再生成
```

## 開発開始手順（iOSシミュレータ）

モバイル表示を確認しながら開発する場合：

```bash
# 1. 開発サーバー起動
make dev          # API使う場合（投票機能など）
make dev-front    # APIなしで十分な場合

# 2. iOSシミュレータ起動
open -a Simulator

# 3. シミュレータでSafariを開き http://localhost:4321 にアクセス
```

シミュレータのデバイス変更：
```bash
xcrun simctl list devices available  # 利用可能なデバイス一覧
xcrun simctl boot "iPhone 17 Pro"    # 特定デバイスを起動
```

## 技術スタック

Astro + Preact + Tailwind / Cloudflare Pages + KV / SVG描画

## 開発方針

- **モバイルファースト**: タッチ操作前提、縦長ビューポート
- **パフォーマンス優先**: Core Web Vitals意識、不要な再レンダリング回避
- **インタラクション**: タップ→詳細、スワイプ→ナビ、ドラッグ→パン、ピンチ→ズーム
- **表示**: 星は白統一、星座線は固有色、複数選択可

## データ追加

**新曲**: `scripts/01-fetch-songs.ts` の `RAW_SONGS` に追加 → `make data`

**ライブ**: `scripts/data/lives-data.ts` に追加
```typescript
{ id: 'tour-2025', name: 'ツアー名', type: 'dome', year: 2025, date: '2025-01-01', color: '#xxx', songs: [...] }
```

**アルバム**: `scripts/data/albums-data.ts` に追加
```typescript
{ id: 'album-id', name: 'アルバム名', type: 'album', releaseDate: '2025-01-01', color: '#xxx', songs: [...] }
```

**Ideas（ロードマップ）**: アイデアの追加・削除時は2箇所を更新
1. `site/src/components/RoadmapModal.tsx` - `ideas` オブジェクトにアイデアを追加/削除
2. `site/functions/api/_shared.ts` - `VALID_IDEA_IDS` に同じIDを追加/削除（投票APIのバリデーション用）

```typescript
// RoadmapModal.tsx
{ id: 'category-feature-name', title: '機能名', description: '説明' }

// _shared.ts
'category-feature-name',  // VALID_IDEA_IDS配列に追加
```

## 公式ガイドライン準拠

> https://www.universal-music.co.jp/mrsgreenapple/guide/

**許可**: 公式サイト/YouTube/ユニバーサル公式からのジャケット・アーティスト・ライブ写真の使用

**遵守事項**:
- 非営利（広告なし、収益化なし）
- 出典明記（© Universal Music Japan）
- アーティストイメージの保護
- 著作権表記（フッターに明記済み）

## 技術メモ

- **画像化**: html-to-image でSVG→PNG、Web Share API で共有
- **歌詞（将来）**: Uta-Net手動取得、一文のみ表示、.gitignore
- **ジャケット（将来）**: 公式から取得、WebP最適化、lazy load

## 参考

- [Music Galaxy](https://galaxy.spotify.com) - 3D音楽宇宙
- [Scaled in Miles](https://scaledinmiles.com) - Miles Davisディスコグラフィ
- [Instafest](https://instafest.app) - フェスポスター生成
