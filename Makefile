.PHONY: install dev dev-api build data clean help

# デフォルトターゲット
help:
	@echo "使用可能なコマンド:"
	@echo "  make install   - 依存関係をインストール"
	@echo "  make dev       - 開発サーバー起動（API含む）"
	@echo "  make dev-front - フロントエンドのみ起動"
	@echo "  make build     - 本番ビルド"
	@echo "  make data      - 楽曲・星座データを再生成"
	@echo "  make clean     - ビルド成果物を削除"

# 依存関係インストール
install:
	cd scripts && npm install
	cd site && npm install

# 開発サーバー起動（API含む、推奨）
dev: install
	cd site && npm run dev:api

# フロントエンドのみ起動（APIなし）
dev-front:
	cd site && npm run dev

# 本番ビルド
build: data
	cd site && npm run build

# 楽曲・星座データ再生成
data:
	cd scripts && npm run build

# ビルド成果物削除
clean:
	rm -rf site/dist
	rm -rf scripts/output
