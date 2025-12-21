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
make dev        # 依存インストール + 開発サーバー起動
make build      # 本番ビルド
make data       # 楽曲・星座データ再生成
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
