.PHONY: install dev dev-api build data clean help mobile-install mobile-dev mobile-build mobile-run sync-mobile

# デフォルトターゲット
help:
	@echo "使用可能なコマンド:"
	@echo "  make install      - 依存関係をインストール"
	@echo "  make dev          - 開発サーバー起動（API含む）"
	@echo "  make dev-front    - フロントエンドのみ起動"
	@echo "  make build        - 本番ビルド"
	@echo "  make data         - 楽曲・星座データを再生成"
	@echo "  make clean        - ビルド成果物を削除"
	@echo ""
	@echo "Mobile（Flutter）:"
	@echo "  make mobile-install - Flutter依存関係をインストール"
	@echo "  make mobile-dev     - iOSシミュレータで実行"
	@echo "  make mobile-build   - リリースビルド"
	@echo "  make sync-mobile    - JSONデータをFlutterにコピー"

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
	rm -rf mobile/build

# --- Mobile (Flutter) ---

# JSONデータをFlutterにコピー
sync-mobile: data
	cp site/src/content/songs.json mobile/assets/data/
	cp site/src/content/positions.json mobile/assets/data/
	cp site/src/content/constellations.json mobile/assets/data/
	cp site/src/content/essences.json mobile/assets/data/

# Flutter依存関係インストール
mobile-install:
	cd mobile && fvm flutter pub get

# iOSシミュレータで実行
mobile-dev: mobile-install sync-mobile
	cd mobile && fvm flutter run

# リリースビルド（iOS/Android）
mobile-build: mobile-install sync-mobile
	cd mobile && fvm flutter build ios --release
	cd mobile && fvm flutter build appbundle --release
