# Flutter アプリ ストア申請ガイド

Flutter アプリを App Store / Google Play に公開するための汎用手順書。

---

## 目次

1. [CI/CD セットアップ（Codemagic）](#1-cicd-セットアップcodemagic)
2. [ストア素材の準備](#2-ストア素材の準備)
3. [ストアへのアップロード](#3-ストアへのアップロード)
4. [自動デプロイ設定](#4-自動デプロイ設定2回目以降)
5. [ストア掲載情報テンプレート](#5-ストア掲載情報テンプレート)

---

## 1. CI/CD セットアップ（Codemagic）

### 1-1. アカウント作成 & リポジトリ接続

1. https://codemagic.io にGitHubアカウントでサインアップ
2. リポジトリを接続
3. 「**Workflow Editor**」モードを使用
   - YAMLモードは個人アカウントで環境変数設定が制限される
   - Workflow Editorなら GUI で簡単に設定可能

### 1-2. Android 署名設定

#### キーストア作成（ローカル）

```bash
# Java が必要（未インストールの場合）
brew install openjdk@17

# キーストア生成
/opt/homebrew/opt/openjdk@17/bin/keytool -genkey -v \
  -keystore android/keystore/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload \
  -dname "CN=Your Name, OU=Personal, O=App Name, L=Tokyo, ST=Tokyo, C=JP" \
  -storepass YOUR_PASSWORD -keypass YOUR_PASSWORD
```

#### key.properties 作成

```properties
# android/key.properties（.gitignore に追加すること）
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=upload
storeFile=../keystore/upload-keystore.jks
```

#### .gitignore に追加

```gitignore
# Android signing
android/key.properties
android/keystore/
*.jks
```

#### build.gradle.kts 修正

`android/app/build.gradle.kts` に署名設定を追加：

```kotlin
import java.util.Properties

// ファイル先頭に追加
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(keystorePropertiesFile.inputStream())
}

android {
    // ... 既存の設定 ...

    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // ... 既存の設定 ...
        }
    }
}
```

#### Codemagic 設定

1. Workflow Editor → **Android code signing** → Enable
2. キーストアファイル（.jks）をアップロード
3. パスワード、エイリアスを入力

### 1-3. iOS 署名設定

#### Apple Developer Portal

1. https://developer.apple.com/account/resources/identifiers/list
2. **Identifiers** → + → App IDs → App
3. Bundle ID: `com.yourcompany.appname`（Explicit）
4. 必要な Capabilities を選択（Push Notifications など）

#### App Store Connect

1. https://appstoreconnect.apple.com → マイApp → + → 新規App
2. Bundle ID を選択
3. SKU を入力（一意の識別子、例: `appname-ios`）
4. アプリ名を入力

#### App Store Connect API Key 作成

1. https://appstoreconnect.apple.com/access/integrations/api → キー
2. + → キー名: `Codemagic` → アクセス: **App Manager**
3. 生成 → **.p8ファイルをダウンロード**（1回のみ、再ダウンロード不可）
4. **Issuer ID**、**Key ID** をメモ

#### Codemagic 設定

1. Workflow Editor → **iOS code signing** → **Automatic**
2. App Store Connect API key を設定
   - Issuer ID
   - Key ID
   - .p8ファイルをアップロード
3. Provisioning profile type: **App store**
4. Bundle identifier を選択

### 1-4. ビルド実行

- Build for platforms: Android ✅, iOS ✅
- Mode: **Release**
- Shorebird: Disabled（使用しない場合）
- **Start new build**

成功すると Artifacts に以下が生成される：
- Android: `app-release.aab`
- iOS: `*.ipa`

---

## 2. ストア素材の準備

### 2-1. アプリアイコン

#### 作成

- **1024 x 1024 px** で作成（PNG、背景透過なし推奨）
- ツール例: Canva, Figma, IconifyAI
- `assets/icon/app_icon.png` に配置

#### 各サイズ自動生成

```yaml
# pubspec.yaml に追加
dev_dependencies:
  flutter_launcher_icons: ^0.14.3

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icon/app_icon.png"
  remove_alpha_ios: true  # iOS は透過不可
```

```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

### 2-2. スクリーンショット

#### 必要なスクリーンショット

| ストア | デバイス | サイズ | 必須 |
|--------|----------|--------|------|
| App Store | iPhone 6.7" | 1290 x 2796 または 1284 x 2778 | ✅ |
| App Store | **iPad 13"** | **2048 x 2732** | **✅ 必須** |
| Google Play | 電話 | 1080 x 1920 | ✅ |

> ⚠️ **重要**: App Store は iPhone と iPad 両方のスクリーンショットが必須です。

#### シミュレータ設定（プロフェッショナルな表示）

```bash
# 利用可能なシミュレータ一覧
xcrun simctl list devices available | grep -E "iPhone|iPad"

# iPhone シミュレータ起動
xcrun simctl boot "iPhone 16 Pro Max"

# iPad シミュレータ起動
xcrun simctl boot "iPad Pro 13-inch (M5)"

# Simulator アプリを開く
open -a Simulator

# ステータスバーを 9:41（Apple公式と同じ）に設定
xcrun simctl status_bar "iPhone 16 Pro Max" override \
  --time "9:41" --batteryState charged --batteryLevel 100

xcrun simctl status_bar "iPad Pro 13-inch (M5)" override \
  --time "9:41" --batteryState charged --batteryLevel 100
```

#### 撮影

```bash
# iPhone スクリーンショット撮影
xcrun simctl io "iPhone 16 Pro Max" screenshot ~/Desktop/iphone.png

# iPad スクリーンショット撮影
xcrun simctl io "iPad Pro 13-inch (M5)" screenshot ~/Desktop/ipad.png
```

#### サイズ調整

```bash
# iPhone - App Store 用（6.7インチ）
sips -z 2778 1284 iphone.png --out appstore/iphone.png

# iPad - App Store 用（13インチ）
sips -z 2732 2048 ipad.png --out appstore/ipad.png

# Google Play 用
sips -z 1920 1080 iphone.png --out googleplay/screenshot.png
```

#### 必要枚数

- **App Store iPhone**: 最低2枚、推奨5-10枚
- **App Store iPad**: 最低2枚、推奨5枚
- **Google Play**: 最低2枚、最大8枚

### 2-3. フィーチャーグラフィック（Google Play 必須）

- サイズ: **1024 x 500 px**
- 内容: アプリアイコン + アプリ名 + キャッチコピー
- ツール例: Canva

### 2-4. プライバシーポリシー

両ストアで**必須**。

- Web サイトに `/privacy` ページを作成
- 含めるべき内容:
  - 収集する情報
  - 収集しない情報
  - 情報の利用目的
  - 第三者への提供
  - データの保存場所
  - 問い合わせ先

---

## 3. ストアへのアップロード

### 3-1. Google Play

1. Codemagic Artifacts から `app-release.aab` をダウンロード
2. [Google Play Console](https://play.google.com/console) → アプリ作成
3. ダッシュボード → 設定タスクを完了
   - アプリのアクセス権
   - 広告
   - コンテンツのレーティング
   - ターゲット ユーザー
   - ニュース アプリ
   - データ セーフティ
4. リリース → 製品版（または内部テスト）
5. AAB をアップロード
6. ストアの掲載情報を入力
7. 審査に提出

### 3-2. App Store

1. Codemagic Artifacts から `.ipa` をダウンロード
2. **Transporter** アプリをインストール（Mac App Store から無料）
3. Transporter で .ipa をアップロード
4. [App Store Connect](https://appstoreconnect.apple.com) → TestFlight でビルド処理待ち（数分〜数十分）
5. アプリ → App Store → ビルドを選択
6. スクリーンショット・説明文を入力
7. 審査に提出

---

## 4. 自動デプロイ設定（2回目以降）

初回申請が完了したら、Codemagic の Distribution セクションで自動化可能。

### Google Play 自動デプロイ

1. Google Play Console → 設定 → API アクセス
2. サービスアカウントを作成
3. JSON キーをダウンロード
4. Codemagic → Distribution → Google Play
5. JSON キーをアップロード
6. トラック選択（internal / alpha / beta / production）

### App Store 自動デプロイ

1. Codemagic → Distribution → App Store Connect
2. 既存の API Key を使用
3. TestFlight に自動アップロード
4. App Store への公開は手動（審査後）

---

## 5. ストア掲載情報テンプレート

### 基本情報

| 項目 | App Store | Google Play |
|------|-----------|-------------|
| アプリ名 | 30文字以内 | 30文字以内 |
| サブタイトル | 30文字以内 | - |
| 短い説明 | - | 80文字以内 |
| 詳細説明 | 4000文字以内 | 4000文字以内 |
| キーワード | 100文字以内 | - |
| カテゴリ | 必須 | 必須 |
| 年齢制限 | 4+ / 9+ / 12+ / 17+ | 全ユーザー / 等 |

### 説明文テンプレート（日本語）

```markdown
【アプリ名】は○○するためのアプリです。

■ 特徴

【機能1】
説明文...

【機能2】
説明文...

■ こんな方におすすめ

- ○○したい方
- ○○に興味がある方

■ 注意事項

（必要に応じて免責事項など）
```

### 説明文テンプレート（英語）

```markdown
[App Name] is an app for [purpose].

■ Features

【Feature 1】
Description...

【Feature 2】
Description...

■ Recommended for

- Those who want to...
- Those interested in...

■ Disclaimer

(If needed)
```

---

## チェックリスト

### ビルド前

- [ ] Bundle ID / Application ID を設定
- [ ] バージョン番号を更新（pubspec.yaml）
- [ ] アプリアイコンを配置
- [ ] flutter_launcher_icons を実行

### Codemagic 設定

- [ ] Android 署名設定完了
- [ ] iOS 署名設定完了
- [ ] Release ビルド成功

### ストア素材

- [ ] スクリーンショット iPhone（最低2枚）
- [ ] スクリーンショット iPad（最低2枚、App Store必須）
- [ ] フィーチャーグラフィック（Google Play）
- [ ] プライバシーポリシーURL

### 申請前

- [ ] 説明文（日本語・英語）
- [ ] キーワード（App Store）
- [ ] カテゴリ選択
- [ ] 年齢制限設定
- [ ] サポートURL

---

## トラブルシューティング

### Codemagic でビルド失敗

1. **キーストアが見つからない**
   - `storeFile` のパスを確認（`../keystore/` が必要な場合あり）

2. **iOS 署名エラー**
   - Provisioning profile type が「App store」になっているか確認
   - Bundle ID が正しいか確認

3. **環境変数が設定できない**
   - YAML モードではなく Workflow Editor を使用

### App Store 審査リジェクト

1. **Guideline 4.2 - Minimum Functionality**
   - アプリの機能が不十分と判断された
   - 機能を追加するか、Web アプリとして公開を検討

2. **Guideline 5.1.1 - Data Collection and Storage**
   - プライバシーポリシーが不十分
   - 収集するデータを明確に記載

### Google Play 審査リジェクト

1. **ポリシー違反**
   - データセーフティの設定を確認
   - 広告の有無を正しく設定

---

## 参考リンク

- [Codemagic Documentation](https://docs.codemagic.io/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Flutter - Build and release an iOS app](https://docs.flutter.dev/deployment/ios)
- [Flutter - Build and release an Android app](https://docs.flutter.dev/deployment/android)
