# App Store / Google Play 掲載情報

---

# CI/CD セットアップ & ストア申請手順

アプリ完成後、ストア申請までの一連の作業手順。

## 1. Codemagic セットアップ

### 1-1. アカウント作成 & リポジトリ接続
1. https://codemagic.io にGitHubアカウントでサインアップ
2. リポジトリを接続
3. 「Workflow Editor」モードを使用（YAMLモードは個人アカウントで環境変数設定が難しい）

### 1-2. Android 署名設定

**キーストア作成（ローカル）**
```bash
# Java が必要
brew install openjdk@17

# キーストア生成
/opt/homebrew/opt/openjdk@17/bin/keytool -genkey -v \
  -keystore mobile/android/keystore/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload \
  -dname "CN=Your Name, OU=Personal, O=App Name, L=Tokyo, ST=Tokyo, C=JP" \
  -storepass YOUR_PASSWORD -keypass YOUR_PASSWORD
```

**key.properties 作成**
```properties
# mobile/android/key.properties（.gitignore済み）
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=upload
storeFile=../keystore/upload-keystore.jks
```

**build.gradle.kts 修正**
- `mobile/android/app/build.gradle.kts` に署名設定を追加（リポジトリ参照）

**Codemagic設定**
- Workflow Editor → Android code signing → Enable
- キーストアファイル（.jks）をアップロード
- パスワード、エイリアスを入力

### 1-3. iOS 署名設定

**Apple Developer Portal**
1. https://developer.apple.com/account/resources/identifiers/list
2. Identifiers → + → App IDs → App
3. Bundle ID: `com.yourcompany.appname`（Explicit）

**App Store Connect**
1. https://appstoreconnect.apple.com → マイApp → + → 新規App
2. Bundle ID を選択、SKU を入力

**App Store Connect API Key 作成**
1. https://appstoreconnect.apple.com/access/integrations/api → キー
2. + → キー名: `Codemagic` → アクセス: App Manager
3. 生成 → .p8ファイルをダウンロード（1回のみ）
4. Issuer ID、Key ID をメモ

**Codemagic設定**
- Workflow Editor → iOS code signing → Automatic
- App Store Connect API key を設定（Issuer ID, Key ID, .p8ファイル）
- Provisioning profile type: **App store**
- Bundle identifier を選択

### 1-4. ビルド実行
- Build for platforms: Android ✅, iOS ✅
- Mode: Release
- Shorebird: Disabled
- Start new build

---

## 2. ストア素材の準備

### 2-1. アプリアイコン

**作成**
- canva で生成（1024x1024）
- `mobile/assets/icon/app_icon.png` に配置

**各サイズ自動生成**
```yaml
# pubspec.yaml に追加
dev_dependencies:
  flutter_launcher_icons: ^0.14.3

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icon/app_icon.png"
  remove_alpha_ios: true
```

```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

### 2-2. スクリーンショット

**シミュレータ設定（9:41表示）**
```bash
xcrun simctl status_bar "iPhone 17 Pro Max" override \
  --time "9:41" --batteryState charged --batteryLevel 100
```

**撮影**
```bash
xcrun simctl io "iPhone 17 Pro Max" screenshot /path/to/screenshot.png
```

**App Store用（1284x2778）**
```bash
sips -z 2778 1284 screenshot.png --out appstore/screenshot.png
```

**Google Play用（1080x1920）**
```bash
sips -z 1920 1080 screenshot.png --out googleplay/screenshot.png
```

### 2-3. フィーチャーグラフィック（Google Play）
- サイズ: 1024 x 500 px
- Canvaで作成
- アプリアイコン + アプリ名 + キャッチコピー

### 2-4. プライバシーポリシー
- web版に `/privacy` ページを作成
- URL: `https://your-domain.com/privacy`

---

## 3. ストアへのアップロード

### 3-1. Google Play
1. Codemagic Artifacts から `app-release.aab` をダウンロード
2. Google Play Console → アプリ作成
3. リリース → 製品版（または内部テスト）
4. AABをアップロード
5. ストア掲載情報を入力
6. 審査に提出

### 3-2. App Store
1. Codemagic Artifacts から `.ipa` をダウンロード
2. **Transporter** アプリ（Mac App Store）をインストール
3. Transporter で .ipa をアップロード
4. App Store Connect → TestFlight でビルド処理待ち
5. アプリ → App Store → ビルドを選択
6. スクリーンショット・説明文を入力
7. 審査に提出

---

## 4. 自動デプロイ設定（2回目以降）

初回申請が完了したら、Codemagic の Distribution セクションで自動化可能：

- **Google Play**: サービスアカウントキー（JSON）が必要
- **App Store Connect**: 既存のAPI Keyで TestFlight に自動アップロード

---

# ストア掲載情報

## アプリ名

**MGA Constellation** / **MGA 星座マップ**

---

## 説明文（日本語）

### 短い説明（80文字以内）- Google Play向け

Mrs. GREEN APPLEの全楽曲を星空に配置。アルバムやライブを選ぶと星座が浮かび上がるファンメイドアプリ。

### 詳細説明

Mrs. GREEN APPLEの全楽曲を星空のように可視化するファンメイドアプリです。

■ 特徴

【星座マップ】
全楽曲がリリース日順に星として配置されています。アルバムやライブを選択すると、収録曲やセットリスト順に星座線が描かれ、美しい星座が浮かび上がります。

【複数選択で比較】
複数のアルバムやライブを同時に選択可能。異なる色の星座線で表示され、共通曲や違いを視覚的に楽しめます。

【AI楽曲分析】
各楽曲のテーマや歌詞の解釈をAIが分析。キーワードやモチーフ、メタファーなど、楽曲の深い魅力を発見できます。

【推し座を作成】
お気に入りの楽曲を選んで、自分だけのオリジナル星座を作成できます。

■ 対応コンテンツ

- アルバム: TWELVE、Variety、ANTENNA、5など
- ライブ: DOME TOUR "BABEL no TOH"、The White Lounge、NOAH no HAKOBUNEなど

■ 注意事項

本アプリはファンによる非公式・非営利のプロジェクトです。
Mrs. GREEN APPLE および Universal Music Japan とは一切関係ありません。

---

## 説明文（英語）

### Short Description (80 chars)

Visualize Mrs. GREEN APPLE's discography as constellations. Fan-made music map.

### Full Description

A fan-made app that visualizes Mrs. GREEN APPLE's entire discography as a starry sky.

■ Features

【Constellation Map】
All songs are arranged as stars in release date order. Select an album or live show, and constellation lines appear connecting songs in track or setlist order.

【Compare Multiple Selections】
Select multiple albums or live shows simultaneously. Each constellation is displayed in a different color, making it easy to spot common songs and differences.

【AI Song Analysis】
Discover deeper meanings through AI-powered analysis of each song's themes, keywords, motifs, and metaphors.

【Create Your Own Constellation】
Select your favorite songs to create your own custom constellation.

■ Disclaimer

This is an unofficial, non-commercial fan project.
Not affiliated with Mrs. GREEN APPLE or Universal Music Japan.

---

## キーワード（App Store用 - 100文字以内）

```
ミセス,Mrs. GREEN APPLE,星座,音楽,楽曲,アルバム,ライブ,セットリスト,ファン,可視化
```

## キーワード（英語）

```
Mrs GREEN APPLE,constellation,music,discography,album,live,setlist,fan,visualization
```

---

## カテゴリ

- **App Store**: エンターテインメント / 音楽
- **Google Play**: エンターテイメント / 音楽＆オーディオ

---

## 年齢制限

- **App Store**: 4+
- **Google Play**: 全ユーザー対象

---

## サポートURL

https://mga-constellation.pages.dev/

## プライバシーポリシーURL

https://mga-constellation.pages.dev/privacy

---

## スクリーンショット説明（App Store用）

1. **星座マップ** - ライブのセットリストが星座として浮かび上がる
2. **アルバム星座** - アルバム収録曲を星座線で可視化
3. **AI分析** - 楽曲のテーマやモチーフをAIが解析
4. **検索** - 121曲から素早く楽曲を検索
5. **推し座作成** - お気に入りの曲でオリジナル星座を作成
